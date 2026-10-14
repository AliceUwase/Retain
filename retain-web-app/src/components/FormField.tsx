import { Box, FormLabel, TextField, type TextFieldProps } from '@mui/material';

type FormFieldProps = TextFieldProps & { id: string; label: string };

// label above the input, like the Figma (MUI's default label floats inside)
export default function FormField({ id, label, ...props }: FormFieldProps) {
  return (
    <Box>
      <FormLabel htmlFor={id} sx={{ display: 'block', mb: 0.75, color: 'text.primary', fontSize: '0.875rem', fontWeight: 500 }}>
        {label}
      </FormLabel>
      <TextField id={id} fullWidth size="small" {...props} />
    </Box>
  );
}
