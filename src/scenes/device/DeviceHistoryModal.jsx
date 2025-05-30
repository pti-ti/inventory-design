import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DeviceHistoryModal = ({ open, handleClose, history }) => {
  const historyArray = Array.isArray(history) ? history : [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
        {historyArray.length === 0 ? (
          <Typography>No hay historial para este dispositivo.</Typography>
        ) : (
          historyArray.map((log, idx) => {
            const changes = log.changes ? JSON.parse(log.changes) : {};
            return (
              <Box key={log.id || idx} mb={3} p={2} border={1} borderRadius={2} borderColor="#e0e0e0">
                <Typography variant="subtitle2" gutterBottom>
                  {log.note}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fecha: {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                </Typography>
                {Object.keys(changes).length > 0 && (
                  <Box mt={1}>
                    <Typography variant="body2" fontWeight="bold">Detalle de cambios:</Typography>
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
                )}
              </Box>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeviceHistoryModal;