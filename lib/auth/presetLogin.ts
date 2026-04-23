/**
 * Đăng nhập 2 nút (Admin / User): không nhập email trên UI.
 * Supabase Auth vẫn dùng email+mật khẩu — email mặc định nội bộ, có thể ghi đè bằng env.
 *
 * Cảnh báo: mật khẩu trong NEXT_PUBLIC_* nằm trong bundle client (phù hợp kiosk / nội bộ).
 */

export const DEFAULT_PRESET_ADMIN_EMAIL = "admin@cutoffscsc.internal";
export const DEFAULT_PRESET_VIEWER_EMAIL = "viewer@cutoffscsc.internal";

export type PresetLoginPair = { email: string; password: string };

export type PresetLoginConfig = {
  admin: PresetLoginPair;
  viewer: PresetLoginPair;
};

function trimEnv(name: string): string {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Bật khi cả hai mật khẩu preset đều có (email lấy mặc định hoặc env).
 */
export function getPresetLoginConfig(): PresetLoginConfig | null {
  const adminPassword = trimEnv("NEXT_PUBLIC_CUTOFF_PRESET_ADMIN_PASSWORD");
  const viewerPassword = trimEnv("NEXT_PUBLIC_CUTOFF_PRESET_VIEWER_PASSWORD");
  if (!adminPassword || !viewerPassword) return null;

  const adminEmail =
    trimEnv("NEXT_PUBLIC_CUTOFF_PRESET_ADMIN_EMAIL") || DEFAULT_PRESET_ADMIN_EMAIL;
  const viewerEmail =
    trimEnv("NEXT_PUBLIC_CUTOFF_PRESET_VIEWER_EMAIL") || DEFAULT_PRESET_VIEWER_EMAIL;

  return {
    admin: { email: adminEmail, password: adminPassword },
    viewer: { email: viewerEmail, password: viewerPassword },
  };
}
