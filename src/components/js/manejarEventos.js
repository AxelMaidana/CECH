// archivo manejarEventos.js
function manejarEventos() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      
      if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
        try {
          const card = e.currentTarget.closest('.card');
          if (!card) return;
          
          const noticiaDoc = doc(db, 'noticias', id);
          await deleteDoc(noticiaDoc);
          
          const imageUrl = card.querySelector('img')?.getAttribute('src');
          if (imageUrl) {
            const storage = getStorage();
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          }
          window.location.reload();
        } catch (error) {
          console.error(error);
          alert('Error al eliminar el curso.');
        }
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const { id, title, date, description, image } = btn.dataset;

      const event = new CustomEvent('editNoticia', {
        detail: { id, title, date, description, imageUrl: image }
      });
      document.dispatchEvent(event);
    });
  });
}

// Ejecutar el script de eventos al cargarse la página
document.addEventListener('DOMContentLoaded', manejarEventos);
