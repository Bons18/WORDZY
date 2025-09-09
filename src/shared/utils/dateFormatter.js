// utils/formatDate.js
export const formatDate = (date) => {
  if (!date) return ""; // si es null o undefined, devuelve cadena vacía
  const parsedDate = new Date(date); // convertir el string a un objeto Date
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`; // Formato: día-mes-año
};
