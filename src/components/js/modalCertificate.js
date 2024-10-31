function initializeCertificateModals() {
    // Función para abrir el modal principal
    const certificatBtn = document.getElementById('certificat-btn');
    if (certificatBtn) {
      certificatBtn.addEventListener('click', function() {
        const modal = document.getElementById('certificat-stepOne-modal');
        modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100');
        setTimeout(function() {
          const modalContent = modal.querySelector('div');
          if (modalContent) modalContent.classList.remove('scale-95', 'translate-y-4');
        }, 10);
      });
    }
  
    // Cerrar el modal principal al hacer clic fuera de él
    const stepOneModal = document.getElementById('certificat-stepOne-modal');
    if (stepOneModal) {
      stepOneModal.addEventListener('click', function(e) {
        if (e.target.id === 'certificat-stepOne-modal') {
          closeModal();
        }
      });
    }
  
    // Abrir el modal de pago al hacer clic en "SIGUIENTE"
    const stepTwoBtn = document.getElementById('stepTwo-btn');
    if (stepTwoBtn) {
      stepTwoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = document.getElementById('certificat-stepTwo-modal');
        closeModal();
        modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100');
        setTimeout(function() {
          const modalContent = modal.querySelector('div');
          if (modalContent) modalContent.classList.remove('scale-95', 'translate-y-4');
        }, 10);
      });
    }
  
    // Cerrar el modal de pago al hacer clic fuera de él
    const stepTwoModal = document.getElementById('certificat-stepTwo-modal');
    if (stepTwoModal) {
      stepTwoModal.addEventListener('click', function(e) {
        if (e.target.id === 'certificat-stepTwo-modal') {
          closeLoginModal();
        }
      });
    }
  
    // Abrir el modal de certificación completada al hacer clic en "FINALIZAR CERTIFICACIÓN"
    const stepThreeBtn = document.getElementById('stepThree-btn');
    if (stepThreeBtn) {
      stepThreeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = document.getElementById('certificat-stepThree-modal');
        closeLoginModal();
        modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100');
        setTimeout(function() {
          const modalContent = modal.querySelector('div');
          if (modalContent) modalContent.classList.remove('scale-95', 'translate-y-4');
        }, 100);
      });
    }
  
    // Cerrar el modal de certificación completada al hacer clic en "CONTINUAR"
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        closeStepThreeModal();
      });
    }
  
    // Cerrar el modal al hacer clic fuera del contenido
    const stepThreeModal = document.getElementById('certificat-stepThree-modal');
    if (stepThreeModal) {
      stepThreeModal.addEventListener('click', function(e) {
        if (e.target.id === 'certificat-stepThree-modal') {
          closeStepThreeModal();
        }
      });
    }
  }
  
  // Funciones auxiliares
  function closeModal() {
    const modal = document.getElementById('certificat-stepOne-modal');
    const modalContent = modal.querySelector('div');
    if (modalContent) {
      modalContent.classList.add('scale-95', 'translate-y-4');
    }
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(function() {
      modal.classList.add('hidden');
    }, 10);
  }
  
  function closeLoginModal() {
    const loginModal = document.getElementById('certificat-stepTwo-modal');
    const loginModalContent = loginModal.querySelector('div');
    if (loginModalContent) {
      loginModalContent.classList.add('scale-95', 'translate-y-4');
    }
    loginModal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(function() {
      loginModal.classList.add('hidden');
    }, 10);
  }
  
  function closeStepThreeModal() {
    const modal = document.getElementById('certificat-stepThree-modal');
    const modalContent = modal.querySelector('#modal-content');
    if (modalContent) {
      modalContent.classList.add('scale-95', 'translate-y-4');
    }
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(function() {
      modal.classList.add('hidden');
    }, 300);
  }
  
  // Inicializar los modales cuando se carga la página
  document.addEventListener('DOMContentLoaded', initializeCertificateModals);
  
  // Inicializar los modales cuando se navega a una nueva página
  document.addEventListener('astro:page-load', initializeCertificateModals);