import { Box, FormLabel, TextField, type TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';

type FormFieldProps = TextFieldProps & { id: string; label: string };

// the label on its own, for inputs that aren't a TextField (like the date picker)
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <FormLabel htmlFor={htmlFor} sx={{ display: 'block', mb: 0.75, color: 'text.primary', fontSize: '0.875rem', fontWeight: 500 }}>
      {children}
    </FormLabel>
  );
}

// label above the input
export default function FormField({ id, label, ...props }: FormFieldProps) {
  return (
    <Box>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <TextField id={id} fullWidth size="small" {...props} />
    </Box>
  );
}
