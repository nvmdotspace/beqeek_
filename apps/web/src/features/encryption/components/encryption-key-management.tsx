import { useState, useRef } from 'react';
import {
  Key,
  Shield,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Copy,
} from 'lucide-react';

import { useEncryption } from '@workspace/active-tables-hooks';
import { useTranslation } from '@/hooks/use-translation';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Textarea } from '@workspace/ui/components/textarea';

const EncryptionKeyManagement = () => {
  const { t } = useTranslation();
  const {
    isInitialized,
    isReady,
    isLoading,
    error,
    initialize,
    changePassword,
    validatePassword,
    clearAllData,
    exportKeys,
    importKeys,
  } = useEncryption();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportedData, setExportedData] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', message: string) => {
    setActionMessage({ type, message });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleInitialize = async () => {
    if (!newPassword) {
      showMessage('error', t('encryption.passwordRequired'));
      return;
    }

    if (newPassword.length < 8) {
      showMessage('error', t('encryption.passwordTooShort'));
      return;
    }

    setActionLoading(true);
    try {
      await initialize(newPassword);
      showMessage('success', t('encryption.initialized'));
      setNewPassword('');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('encryption.initializeFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', t('encryption.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', t('encryption.passwordsNotMatch'));
      return;
    }

    if (newPassword.length < 8) {
      showMessage('error', t('encryption.passwordTooShort'));
      return;
    }

    setActionLoading(true);
    try {
      const isValid = await validatePassword(currentPassword);
      if (!isValid) {
        showMessage('error', t('encryption.currentPasswordInvalid'));
        return;
      }

      await changePassword(currentPassword, newPassword);
      showMessage('success', t('encryption.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('encryption.changePasswordFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportKeys = async () => {
    setActionLoading(true);
    try {
      const keys = await exportKeys();
      const jsonData = JSON.stringify(keys, null, 2);
      setExportedData(jsonData);

      // Download as file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encryption-keys-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showMessage('success', t('encryption.keysExported'));
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('encryption.exportFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportKeys = async () => {
    if (!importData.trim()) {
      showMessage('error', t('encryption.importDataRequired'));
      return;
    }

    setActionLoading(true);
    try {
      const keys = JSON.parse(importData);
      await importKeys(keys);
      showMessage('success', t('encryption.keysImported'));
      setImportData('');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('encryption.importFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    if (!confirm(t('encryption.clearAllDataConfirm'))) {
      return;
    }

    setActionLoading(true);
    try {
      await clearAllData();
      showMessage('success', t('encryption.allDataCleared'));
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('encryption.clearDataFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('success', t('encryption.copiedToClipboard'));
  };

  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('encryption.initializeTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t('encryption.initializeDescription')}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t('encryption.masterPassword')}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('encryption.enterMasterPassword')}
                  disabled={isLoading || actionLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || actionLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleInitialize} disabled={isLoading || actionLoading || !newPassword} className="w-full">
              {actionLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
              {t('encryption.initialize')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('encryption.keyManagement')}</h1>
          <p className="text-muted-foreground">{t('encryption.keyManagementDescription')}</p>
        </div>
        <Badge variant={isReady ? 'default' : 'secondary'} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {isReady ? t('encryption.ready') : t('encryption.notReady')}
        </Badge>
      </div>

      {actionMessage && (
        <Alert variant={actionMessage.type === 'error' ? 'destructive' : 'default'}>
          {actionMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{actionMessage.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList>
          <TabsTrigger value="security">{t('encryption.security')}</TabsTrigger>
          <TabsTrigger value="backup">{t('encryption.backupRestore')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('encryption.advanced')}</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('encryption.changePassword')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('encryption.currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t('encryption.enterCurrentPassword')}
                      disabled={actionLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={actionLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('encryption.newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('encryption.enterNewPassword')}
                      disabled={actionLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={actionLoading}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('encryption.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('encryption.confirmNewPassword')}
                      disabled={actionLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={actionLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={actionLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {actionLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {t('encryption.changePassword')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('encryption.exportKeys')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('encryption.exportKeysDescription')}</p>
                <Button onClick={handleExportKeys} disabled={actionLoading} className="w-full">
                  {actionLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {t('encryption.export')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('encryption.importKeys')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('encryption.importKeysDescription')}</p>

                <div className="space-y-2">
                  <Label htmlFor="file-input">{t('encryption.selectFile')}</Label>
                  <Input
                    id="file-input"
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    ref={fileInputRef}
                    disabled={actionLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-data">{t('encryption.orPasteData')}</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={t('encryption.pasteKeysHere')}
                    rows={6}
                    disabled={actionLoading}
                  />
                </div>

                <Button onClick={handleImportKeys} disabled={actionLoading || !importData} className="w-full">
                  {actionLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {t('encryption.import')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                {t('encryption.dangerZone')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{t('encryption.dangerZoneDescription')}</AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      {t('encryption.viewExportedData')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('encryption.exportedData')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea value={exportedData} readOnly rows={10} className="font-mono text-xs" />
                      <Button onClick={() => copyToClipboard(exportedData)} disabled={!exportedData} className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        {t('encryption.copyToClipboard')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" onClick={handleClearAllData} disabled={actionLoading}>
                  {actionLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t('encryption.clearAllData')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EncryptionKeyManagement;
