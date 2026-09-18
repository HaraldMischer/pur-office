// pur-office/functions/src/create-benutzer.spec.ts

import { HttpsError } from 'firebase-functions/v2/https';
import { describe, expect, it, vi } from 'vitest';

import { handleCreateBenutzer, ICreateBenutzerData } from './create-benutzer';

describe('handleCreateBenutzer', () => {
  const data: ICreateBenutzerData = {
    email: 'user@example.com',
    anzeigename: 'Test Benutzer',
    userRole: 'office',
    erlaubteBereiche: ['dashboard', 'schichtplan'],
    zugriffe: [
      {
        firmaId: 'firma-1',
        filialIds: ['filiale-1'],
      },
    ],
    passwort: 'SicheresPasswort123!',
  };

  function createDependencies() {
    return {
      getBenutzerProfil: vi.fn().mockResolvedValue({
        aktiv: true,
        userRole: 'master',
      }),
      createAuthBenutzer: vi.fn().mockResolvedValue({ uid: 'neu-123' }),
      setBenutzerDokument: vi.fn().mockResolvedValue(undefined),
      deleteAuthBenutzer: vi.fn().mockResolvedValue(undefined),
      logRollbackError: vi.fn(),
    };
  }

  it('should create auth user and user document for an active master', async () => {
    const dependencies = createDependencies();

    const result = await handleCreateBenutzer(
      {
        auth: { uid: 'master-123' },
        data,
      },
      dependencies,
    );

    expect(dependencies.getBenutzerProfil).toHaveBeenCalledWith('master-123');
    expect(dependencies.createAuthBenutzer).toHaveBeenCalledWith({
      email: data.email,
      displayName: data.anzeigename,
      password: data.passwort,
    });
    const { passwort, ...profil } = data;
    expect(dependencies.setBenutzerDokument).toHaveBeenCalledWith('neu-123', profil);
    expect(dependencies.setBenutzerDokument.mock.calls[0][1]).not.toHaveProperty('passwort');
    expect(result).toEqual({
      uid: 'neu-123',
      email: data.email,
    });
  });

  it('should reject unauthenticated requests', async () => {
    const dependencies = createDependencies();

    await expect(
      handleCreateBenutzer(
        {
          auth: null,
          data,
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'unauthenticated',
    });

    expect(dependencies.createAuthBenutzer).not.toHaveBeenCalled();
  });

  it('should reject users without the master role', async () => {
    const dependencies = createDependencies();
    dependencies.getBenutzerProfil.mockResolvedValue({
      aktiv: true,
      userRole: 'office',
    });

    await expect(
      handleCreateBenutzer(
        {
          auth: { uid: 'office-123' },
          data,
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'permission-denied',
    });
  });

  it('should reject invalid input data', async () => {
    const dependencies = createDependencies();

    await expect(
      handleCreateBenutzer(
        {
          auth: { uid: 'master-123' },
          data: {
            ...data,
            erlaubteBereiche: [],
          },
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'invalid-argument',
    });

    expect(dependencies.createAuthBenutzer).not.toHaveBeenCalled();
  });

  it('should create a user with a password chosen by the master', async () => {
    const dependencies = createDependencies();
    const passwordData: ICreateBenutzerData = {
      ...data,
      passwort: 'SicheresPasswort123!',
    };

    const result = await handleCreateBenutzer(
      { auth: { uid: 'master-123' }, data: passwordData },
      dependencies,
    );

    expect(dependencies.createAuthBenutzer).toHaveBeenCalledWith({
      email: data.email,
      displayName: data.anzeigename,
      password: passwordData.passwort,
    });
    expect(result).toEqual({ uid: 'neu-123', email: data.email });
  });

  it.each([undefined, '', 'short'])(
    'should reject a missing or short password: %s',
    async (passwort) => {
      const dependencies = createDependencies();

      await expect(
        handleCreateBenutzer(
          {
            auth: { uid: 'master-123' },
            data: { ...data, passwort },
          },
          dependencies,
        ),
      ).rejects.toMatchObject({ code: 'invalid-argument' });

      expect(dependencies.createAuthBenutzer).not.toHaveBeenCalled();
    },
  );

  it('should return an understandable error for an existing email address', async () => {
    const dependencies = createDependencies();
    dependencies.createAuthBenutzer.mockRejectedValue({
      code: 'auth/email-already-exists',
    });

    await expect(
      handleCreateBenutzer(
        {
          auth: { uid: 'master-123' },
          data,
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'already-exists',
    });
  });

  it('should delete the auth user when writing the user document fails', async () => {
    const dependencies = createDependencies();
    dependencies.setBenutzerDokument.mockRejectedValue(new Error('Firestore error'));

    await expect(
      handleCreateBenutzer(
        {
          auth: { uid: 'master-123' },
          data,
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'internal',
    });

    expect(dependencies.deleteAuthBenutzer).toHaveBeenCalledWith('neu-123');
  });

  it('should log a failed rollback', async () => {
    const dependencies = createDependencies();
    const rollbackError = new Error('Auth rollback error');
    dependencies.setBenutzerDokument.mockRejectedValue(new Error('Firestore error'));
    dependencies.deleteAuthBenutzer.mockRejectedValue(rollbackError);

    await expect(
      handleCreateBenutzer(
        {
          auth: { uid: 'master-123' },
          data,
        },
        dependencies,
      ),
    ).rejects.toMatchObject<Partial<HttpsError>>({
      code: 'internal',
    });

    expect(dependencies.logRollbackError).toHaveBeenCalledWith('neu-123', rollbackError);
  });
});
