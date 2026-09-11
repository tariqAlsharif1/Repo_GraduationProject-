export default function Settings() {
  return (
    <div className="p-4 lg:p-8 max-w-xl">
      <div className="bg-white rounded-xl2 border border-line shadow-card p-6 space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink900 mb-1">Profile</h2>
          <p className="text-sm text-ink400">Demo single-user account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink900 mb-1.5">Username</label>
            <input
              disabled
              value="Tariq"
              className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink900 mb-1.5">Email</label>
            <input
              disabled
              value="tariq@demo.app"
              className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink900 mb-1.5">Currency</label>
          <input
            disabled
            value="Jordanian Dinar (JD)"
            className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink600"
          />
        </div>

        <p className="text-xs text-ink400">
          Editable profile settings and authentication are out of scope for this graduation
          project — the backend assumes a single demo user (user_id = 1).
        </p>
      </div>
    </div>
  );
}
