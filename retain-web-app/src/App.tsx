import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'

// Temporary preview to check the theme. 
function App() {
  return (
    <Box sx={{ p: 4, maxWidth: 640 }}>
      <Typography variant="h1" gutterBottom>
        Spending tracker
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Theme preview: colours, font, buttons, chips and a progress bar.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            October budget
          </Typography>
          <LinearProgress variant="determinate" value={74} sx={{ my: 2 }} />
          <Stack direction="row" spacing={1}>
            <Chip label="Within budget" color="success" />
            <Chip label="Approaching budget" color="warning" />
            <Chip label="Over budget" color="error" />
            
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1}>
        <Button variant="contained">Add expense</Button>
        <Button variant="outlined">Cancel</Button>
      </Stack>
    </Box>
  )
}

export default App
