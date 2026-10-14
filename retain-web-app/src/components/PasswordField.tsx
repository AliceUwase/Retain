import { IconButton, InputAdornment } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import FormField from './FormField';

// FormField with the eye button to show or hide the password
export default function PasswordField(props: ComponentProps<typeof FormField>) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
