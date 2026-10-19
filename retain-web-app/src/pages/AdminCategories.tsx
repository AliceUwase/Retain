import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import LoadError from '../components/LoadError';
import { addCategory, deleteCategory, getCategoryUsage, updateCategory } from '../services/categoryService';
import type { Category } from '../types';

// returns an error message, or '' if the name is fine
function checkName(name: string, categories: Category[], ignoreId?: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Please enter a name.';
  const taken = categories.some((c) => c.id !== ignoreId && c.name.toLowerCase() === trimmed.toLowerCase());
  return taken ? `"${trimmed}" already exists.` : '';
}

function RenameDialog({
  category,
  categories,
  onClose,
  onSave,
}: {
  category: Category;
  categories: Category[];
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = checkName(name, categories, category.id);
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await onSave(name.trim());
    } catch (err) {
      setError((err as Error).message); // the API's reason, e.g. the name was taken in the meantime
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Rename category</DialogTitle>
      <DialogContent>
        <Box component="form" id="rename-form" onSubmit={handleSubmit} noValidate sx={{ pt: 1 }}>
          <FormField id="rename" label="Name" value={name} onChange={(e) => setName(e.target.value)} error={!!error} helperText={error} autoFocus />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderColor: 'divider', color: 'text.primary' }}>
          Cancel
        </Button>
        <Button type="submit" form="rename-form" variant="contained" loading={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({}); // category id → how many expenses use it
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<Category | null>(null);
  const [removing, setRemoving] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumping this loads the data again

  useEffect(() => {
    // one request gives every category with its expense count, instead of loading every expense
    getCategoryUsage()
      .then((usage) => {
        setCategories(usage.map((u) => ({ id: u.categoryId, name: u.name, isDefault: u.isDefault })));
        setCounts(Object.fromEntries(usage.map((u) => [u.categoryId, u.expenseCount])));
        setLoading(false);
      })
      .catch(() => setLoadError(true));
  }, [attempt]);

  function retry() {
    setLoadError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  // how many expenses (all users) use each category
  const countFor = (id: string) => counts[id] ?? 0;

  async function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = checkName(newName, categories);
    setAddError(problem);
    if (problem) return;

    setAdding(true);
    try {
      const added = await addCategory(newName.trim());
      setCategories((current) => [...current, added]);
      setNewName('');
      setMessage(`"${added.name}" was added.`);
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(name: string) {
    if (!renaming) return;
    const updated = await updateCategory(renaming.id, name);
    setCategories((current) => current.map((c) => (c.id === updated.id ? updated : c)));
    setRenaming(null);
    setMessage(`Renamed to "${updated.name}".`);
  }

  async function handleDelete() {
    if (!removing) return;
    setDeleting(true);
    try {
      const { movedExpenses } = await deleteCategory(removing.id);
      // mirror what the API did: the moved expenses now count for Uncategorized
      const fallback = categories.find((c) => c.isDefault);
      if (fallback) setCounts((current) => ({ ...current, [fallback.id]: (current[fallback.id] ?? 0) + movedExpenses }));
      setCategories((current) => current.filter((c) => c.id !== removing.id));
      setMessage(
        movedExpenses === 0
          ? `"${removing.name}" was deleted.`
          : `"${removing.name}" was deleted. ${movedExpenses} ${movedExpenses === 1 ? 'expense' : 'expenses'} moved to "${fallback?.name ?? 'Uncategorized'}".`,
      );
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setRemoving(null);
      setDeleting(false);
    }
  }

  if (loadError) return <LoadError onRetry={retry} />;
  if (loading) return <Typography color="text.secondary">Loading categories…</Typography>;

  const removingCount = removing ? countFor(removing.id) : 0;

  return (
    <Box>
      <Typography variant="h1">Categories</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The categories everyone picks from when they record an expense.
      </Typography>

      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3 }}>
        <Box component="form" onSubmit={handleAdd} noValidate sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <FormField
              id="new-category"
              label="New category"
              placeholder="e.g. Travel"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              error={!!addError}
              helperText={addError}
            />
          </Box>
          {/* lines the button up with the input, under the label */}
          <Button type="submit" variant="contained" startIcon={<Plus size={16} />} loading={adding} sx={{ mt: 3.25 }}>
            Add category
          </Button>
        </Box>
      </Card>

      <Card>
        <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 2, alignItems: 'center' }}>
          <Typography variant="h2">All categories</Typography>
          <Chip size="small" label={categories.length} />
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Expenses</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              const isDefault = category.isDefault === true;
              return (
                <TableRow key={category.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <CategoryIcon name={category.name} size={32} />
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{category.name}</Typography>
                      {isDefault && <Chip size="small" label="Default" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{countFor(category.id)}</TableCell>
                  <TableCell align="right">
                    {isDefault ? (
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Can't be changed</Typography>
                    ) : (
                      <>
                        <Tooltip title="Rename">
                          <IconButton size="small" onClick={() => setRenaming(category)} aria-label={`Rename ${category.name}`}>
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setRemoving(category)} aria-label={`Delete ${category.name}`}>
                            <Trash size={16} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {renaming && (
        <RenameDialog category={renaming} categories={categories} onClose={() => setRenaming(null)} onSave={handleRename} />
      )}

      <ConfirmDialog
        open={removing !== null}
        title={`Delete "${removing?.name}"?`}
        confirmLabel="Delete category"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setRemoving(null)}
      >
        {removingCount === 0
          ? 'No expenses use this category, so nothing else changes.'
          : `${removingCount} ${removingCount === 1 ? 'expense uses' : 'expenses use'} this category. ${
              removingCount === 1 ? 'It' : 'They'
            } will move to "Uncategorized".`}
      </ConfirmDialog>

      <Snackbar
        open={message !== ''}
        message={message}
        autoHideDuration={4000}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
