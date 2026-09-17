// pur-office/rules-tests/firestore.rules.test.mjs

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-pur-office',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
});

after(async () => {
  await testEnvironment.cleanup();
});

test('keeps authenticated access to legacy collections and subcollections', async () => {
  const firestore = testEnvironment.authenticatedContext('legacy-user').firestore();
  const customer = doc(firestore, 'purCustomers/customer-1');
  const machine = doc(firestore, 'purCustomers/customer-1/machines/machine-1');

  await assertSucceeds(setDoc(customer, { name: 'Customer' }));
  await assertSucceeds(getDoc(customer));
  await assertSucceeds(setDoc(machine, { name: 'Machine' }));
  await assertSucceeds(deleteDoc(machine));
});

test('continues to reject unauthenticated access to legacy collections', async () => {
  const firestore = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(getDoc(doc(firestore, 'purCustomers/customer-1')));
  await assertFails(setDoc(doc(firestore, 'purUser/user-1'), { active: true }));
});

test('allows a user to read only the own Pur Office profile', async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'benutzer/user-1'), { uid: 'user-1' });
    await setDoc(doc(context.firestore(), 'benutzer/user-2'), { uid: 'user-2' });
  });

  const firestore = testEnvironment.authenticatedContext('user-1').firestore();
  const ownProfile = await assertSucceeds(getDoc(doc(firestore, 'benutzer/user-1')));

  assert.equal(ownProfile.data()?.['uid'], 'user-1');
  await assertFails(getDoc(doc(firestore, 'benutzer/user-2')));
  await assertFails(getDocs(collection(firestore, 'benutzer')));
});

test('rejects all client writes to Pur Office profiles', async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'benutzer/user-1'), {
      uid: 'user-1',
      userRole: 'filiale',
    });
  });

  const firestore = testEnvironment.authenticatedContext('user-1').firestore();

  await assertFails(
    setDoc(doc(firestore, 'benutzer/user-1'), { userRole: 'master' }, { merge: true }),
  );
  await assertFails(setDoc(doc(firestore, 'benutzer/new-user'), { uid: 'new-user' }));
  await assertFails(deleteDoc(doc(firestore, 'benutzer/user-1')));
});
