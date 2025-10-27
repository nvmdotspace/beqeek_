import * as React from 'react';
import { Toaster, toast, type ToasterProps } from 'sonner';

const UiToaster = (props: ToasterProps) => <Toaster closeButton theme="system" richColors {...props} />;

export { UiToaster as Toaster, toast };
