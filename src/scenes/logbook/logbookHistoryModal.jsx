// LogbookHistoryModal.jsx
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LogbookHistoryModal = ({ open, handleClose, logbook }) => {
  if (!logbook) return null;
  let changes = {};
  try {
    changes = logbook.changes ? JSON.parse(logbook.changes) : {};
  } catch {
    changes = {};
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Historial de cambios
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1">{logbook.note}</Typography>
        {Object.keys(changes).length > 0 ? (
          <Box mt={2}>
            <Typography variant="subtitle2">Detalle de cambios:</Typography>
            <ul>
              {Object.entries(changes).map(([campo, valores]) => (
                <li key={campo}>
                  <strong>{campo}:</strong>{" "}
                  <span style={{ color: "#e57373" }}>{valores.antes}</span> →{" "}
                  <span style={{ color: "#388e3c" }}>{valores.despues}</span>
                </li>
              ))}
            </ul>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Sin detalle de cambios.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogbookHistoryModal;