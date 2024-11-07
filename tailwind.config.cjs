/** @type {import('tailwindcss').Config} */

export default {
	content: [
	  "./src/**/*.{html,js,jsx,ts,tsx,astro}",  // Asegúrate de incluir todos los archivos relevantes
	],
	theme: {
	  extend: {
		
		boxShadow: {
			customButton: '6px 6px 6px rgba(0, 0, 0, 0.25)',
			custom: '0px 4px 6px rgba(0, 0, 0, 0.25)',
		},
		colors: {
		  customBlue: '#187498',
		  customGreen: '#36AE7C',
		  customBlack: '#2E2E2E',
		  customCyan: '#4DC9DE',
		},
		fontSize: {
			'responsive': 'clamp(0.75rem, 1vw + 0.25rem, 1rem)', // Tamaño responsivo
		  	},
		padding: {
			'responsive': 'clamp(0.5rem, 2vw + 0.25rem, 1rem)', // Padding responsivo
			},
	  },
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
  }
  