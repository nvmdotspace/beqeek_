import { Suspense } from 'react';
import EncryptionKeyManagement from '../components/encryption-key-management';

const EncryptionSettingsPage = () => {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EncryptionKeyManagement />
    </Suspense>
  );
};

export { EncryptionSettingsPage };
export default EncryptionSettingsPage;
