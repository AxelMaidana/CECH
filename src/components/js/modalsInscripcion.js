function initializeInscripcionModals() {
  // Función para abrir el modal principal
  const inscribirmeBtn = document.getElementById('inscribirme-btn');
  if (inscribirmeBtn) {
    inscribirmeBtn.addEventListener('click', () => {
      const modal = document.getElementById('modal');
      modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100');
      setTimeout(() => {
        modal.querySelector('div').classList.remove('scale-95', 'translate-y-4');
      }, 100);
    });
  }

  // Abrir el modal de inicio de sesión
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const modal = document.getElementById('modal');
      const loginModal = document.getElementById('login-modal');
      closeModal();
      loginModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      loginModal.classList.add('opacity-100');
      setTimeout(() => {
        loginModal.querySelector('div').classList.remove('scale-95', 'translate-y-4');
      }, 100);
    });
  }

  // Cerrar el modal de inicio de sesión al hacer clic fuera de él
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }

  // Abrir el modal de registro desde el modal de inicio de sesión
  const registerLink2 = document.getElementById('register-link-2');
  if (registerLink2) {
    registerLink2.addEventListener('click', (e) => {
      e.preventDefault();
      closeLoginModal();
      const registerModal = document.getElementById('register-modal');
      registerModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      registerModal.classList.add('opacity-100');
      setTimeout(() => {
        registerModal.querySelector('div').classList.remove('scale-95', 'translate-y-4');
      }, 100);
    });
  }

  // Función para abrir el modal de registro
  const registerLink = document.getElementById('register-link');
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('modal').classList.add('hidden');
      const registerModal = document.getElementById('register-modal');
      registerModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      registerModal.classList.add('opacity-100');
    });
  }

  // Cerrar el modal de registro y mostrar modal de certificación completada
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-modal').classList.add('hidden');
      const finalModal = document.getElementById('final-modal');
      finalModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
      finalModal.classList.add('opacity-100');
    });
  }

  // Cerrar el modal de certificación completada
  const closeFinalBtn = document.getElementById('close-final-btn');
  if (closeFinalBtn) {
    closeFinalBtn.addEventListener('click', () => {
      document.getElementById('final-modal').classList.add('hidden');
    });
  }

  // Cerrar los modales al hacer clic fuera de ellos
  const modals = document.querySelectorAll('.fixed');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// Funciones auxiliares
function closeModal() {
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('div');
  modalContent.classList.add('scale-95', 'translate-y-4');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 10);
}

function closeLoginModal() {
  const loginModal = document.getElementById('login-modal');
  loginModal.querySelector('div').classList.add('scale-95', 'translate-y-4');
  loginModal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    loginModal.classList.add('hidden');
  }, 300);
}

// Inicializar los modales cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeInscripcionModals);

// Inicializar los modales cuando se navega a una nueva página
document.addEventListener('astro:page-load', initializeInscripcionModals);