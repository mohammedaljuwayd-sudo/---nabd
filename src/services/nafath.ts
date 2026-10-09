import { User, UserRole } from '../types/nabd';

export interface INafathProvider {
  requestLogin(nationalId: string, role: UserRole): Promise<{ challengeCode: string; sessionId: string }>;
  verifyChallenge(sessionId: string): Promise<User>;
  loginWithPassword(identifier: string, pass: string, role?: UserRole): Promise<User>;
  registerUser(data: {
    name: string;
    nationalId: string;
    phone: string;
    email: string;
    district: string;
    password?: string;
    role: UserRole;
  }): Promise<User>;
  getCurrentUser(): User | null;
  logout(): Promise<void>;
  switchDemoRole(newRole: UserRole): User;
}

const STORAGE_KEY_AUTH = 'nabd_current_user_v2';
const STORAGE_KEY_ACCOUNTS = 'nabd_registered_accounts_v2';
const STORAGE_KEY_SESSION = 'nabd_nafath_pending_session_v2';

export function maskNationalId(id: string): string {
  if (!id || id.length < 6) return '1000••••01';
  const clean = id.trim();
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  return `${start}••••${end}`;
}

export function hashNationalId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hash_' + Math.abs(hash).toString(16) + 'sa';
}

class MockNafathProvider implements INafathProvider {
  private currentUser: User | null = null;
  private accounts: Array<User & { password?: string; rawId?: string }> = [];

  constructor() {
    this.loadAccounts();
    this.loadSession();
  }

  private loadAccounts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (saved) {
        this.accounts = JSON.parse(saved);
      } else {
        // Seed standard accounts
        this.accounts = [
          {
            id: 'usr_cit_default',
            nationalIdHash: hashNationalId('1084291833'),
            rawId: '1084291833',
            maskedId: '1084••••33',
            name: 'عبدالله بن فهد الشمري',
            phone: '0554129831',
            email: 'a.alshammari@gmail.com',
            district: 'وسط الدمام (حي السوق)',
            role: 'citizen',
            username: 'alshammari',
            password: 'password123',
          },
          {
            id: 'usr_emp_default',
            nationalIdHash: hashNationalId('1022449955'),
            rawId: '1022449955',
            maskedId: '1022••••55',
            name: 'م. ريان القحطاني',
            phone: '0503348122',
            email: 'r.alqahtani@eamana.gov.sa',
            district: 'الفيصلية - إدارة الصيانة',
            role: 'employee',
            username: 'r.alqahtani',
            password: 'password123',
          },
          {
            id: 'usr_dec_default',
            nationalIdHash: hashNationalId('1011883344'),
            rawId: '1011883344',
            maskedId: '1011••••44',
            name: 'أ. د. خالد السعدون (وكيل الأمانة)',
            phone: '0501192834',
            email: 'k.alsaadoon@eamana.gov.sa',
            district: 'الأمانة المركزية',
            role: 'decision_maker',
            username: 'k.alsaadoon',
            password: 'password123',
          },
        ];
        this.saveAccounts();
      }
    } catch {
      this.accounts = [];
    }
  }

  private saveAccounts() {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(this.accounts));
  }

  private loadSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public async requestLogin(
    nationalId: string,
    role: UserRole
  ): Promise<{ challengeCode: string; sessionId: string }> {
    const cleanId = nationalId.trim();
    if (!/^[12]\d{9}$/.test(cleanId)) {
      throw new Error('رقم الهوية الوطنية أو الإقامة يجب أن يتكون من 10 أرقام تبدأ بـ 1 أو 2');
    }

    const challengeCode = Math.floor(10 + Math.random() * 90).toString();
    const sessionId = 'nafath_sess_' + Date.now();

    // Check if account already exists
    const existing = this.accounts.find((a) => a.rawId === cleanId);

    const pendingData = {
      sessionId,
      challengeCode,
      nationalIdHash: hashNationalId(cleanId),
      maskedId: maskNationalId(cleanId),
      role,
      name:
        existing?.name ||
        (role === 'citizen'
          ? 'عبدالله بن فهد الشمري'
          : role === 'employee'
          ? 'م. ريان القحطاني (إدارة صيانة الطرق)'
          : 'أ. د. خالد السعدون (وكيل الأمانة للخدمات)'),
      phone: existing?.phone || '0554129831',
      email: existing?.email || 'user@eamana.gov.sa',
      district: existing?.district || 'وسط الدمام',
      createdAt: Date.now(),
    };

    sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(pendingData));
    return { challengeCode, sessionId };
  }

  public async verifyChallenge(sessionId: string): Promise<User> {
    const raw = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) {
      throw new Error('انتهت صلاحية جلسة نفاذ، يرجى إعادة المحاولة');
    }

    const sessionData = JSON.parse(raw);
    if (sessionData.sessionId !== sessionId) {
      throw new Error('رمز الجلسة غير متطابق');
    }

    const user: User = {
      id: 'usr_' + sessionData.nationalIdHash.substring(0, 8),
      nationalIdHash: sessionData.nationalIdHash,
      maskedId: sessionData.maskedId,
      name: sessionData.name,
      role: sessionData.role,
      phone: sessionData.phone,
      email: sessionData.email,
      district: sessionData.district,
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    return user;
  }

  public async loginWithPassword(identifier: string, pass: string, role?: UserRole): Promise<User> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('يرجى إدخال اسم المستخدم / الهوية وكلمة المرور');
    }

    const found = this.accounts.find(
      (a) =>
        (a.username?.toLowerCase() === cleanId ||
          a.email?.toLowerCase() === cleanId ||
          a.rawId === cleanId ||
          a.phone === cleanId) &&
        (a.password === cleanPass || cleanPass === 'password123' || cleanPass.length >= 6)
    );

    if (found) {
      const activeUser: User = {
        id: found.id,
        nationalIdHash: found.nationalIdHash,
        maskedId: found.maskedId,
        name: found.name,
        role: role || found.role,
        phone: found.phone,
        email: found.email,
        district: found.district,
        username: found.username,
      };
      this.currentUser = activeUser;
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(activeUser));
      return activeUser;
    }

    // If national ID valid, allow login for flexibility
    if (/^[12]\d{9}$/.test(cleanId)) {
      const dynamicUser: User = {
        id: 'usr_' + hashNationalId(cleanId).substring(0, 8),
        nationalIdHash: hashNationalId(cleanId),
        maskedId: maskNationalId(cleanId),
        name: role === 'employee' ? 'م. ريان القحطاني' : 'مستفيد جديد',
        role: role || 'citizen',
        phone: '05XXXXXXXX',
        email: 'user@portal.sa',
        district: 'حاضرة الدمام',
      };
      this.currentUser = dynamicUser;
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(dynamicUser));
      return dynamicUser;
    }

    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  public async registerUser(data: {
    name: string;
    nationalId: string;
    phone: string;
    email: string;
    district: string;
    password?: string;
    role: UserRole;
  }): Promise<User> {
    const cleanId = data.nationalId.trim();
    if (!/^[12]\d{9}$/.test(cleanId)) {
      throw new Error('رقم الهوية الوطنية أو الإقامة يجب أن يتكون من 10 أرقام تبدأ بـ 1 أو 2');
    }

    if (!data.name || data.name.trim().length < 3) {
      throw new Error('يرجى كتابة الاسم الكامل بصورة صحيحة');
    }

    const newUser: User & { password?: string; rawId?: string } = {
      id: 'usr_reg_' + Date.now(),
      nationalIdHash: hashNationalId(cleanId),
      rawId: cleanId,
      maskedId: maskNationalId(cleanId),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      district: data.district.trim(),
      role: data.role,
      password: data.password || 'password123',
      registeredAt: new Date().toISOString(),
    };

    this.accounts.unshift(newUser);
    this.saveAccounts();

    this.currentUser = {
      id: newUser.id,
      nationalIdHash: newUser.nationalIdHash,
      maskedId: newUser.maskedId,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      email: newUser.email,
      district: newUser.district,
    };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  public getCurrentUser(): User | null {
    if (!this.currentUser) {
      this.loadSession();
    }
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }

  public switchDemoRole(newRole: UserRole): User {
    const found = this.accounts.find((a) => a.role === newRole);
    if (found) {
      this.currentUser = {
        id: found.id,
        nationalIdHash: found.nationalIdHash,
        maskedId: found.maskedId,
        name: found.name,
        role: newRole,
        phone: found.phone,
        email: found.email,
        district: found.district,
      };
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(this.currentUser));
      return this.currentUser;
    }

    const fallbackUser: User = {
      id: 'usr_' + Date.now(),
      nationalIdHash: 'hash_88912sa',
      maskedId: '1084••••33',
      name:
        newRole === 'citizen'
          ? 'عبدالله بن فهد الشمري'
          : newRole === 'employee'
          ? 'م. ريان القحطاني (إدارة الصيانة)'
          : 'أ. د. خالد السعدون (وكيل الأمانة)',
      role: newRole,
      phone: '0554129831',
      email: 'user@eamana.gov.sa',
      district: 'وسط الدمام',
    };

    this.currentUser = fallbackUser;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(fallbackUser));
    return fallbackUser;
  }
}

export const nafathService: INafathProvider = new MockNafathProvider();
