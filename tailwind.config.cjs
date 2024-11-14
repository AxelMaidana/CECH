/** @type {import('tailwindcss').Config} */

export default {
	content: [
	  "./src/**/*.{html,js,jsx,ts,tsx,astro}",  // Asegúrate de incluir todos los archivos relevantes
	],
	theme: {
	  extend: {
		textShadow: {
			uno: '0px 0px 0px rgba(0, 0, 0, 0)',
			dos: '0px 0px 10px rgba(0, 0, 0, 0.5)',
			tres: '0px 0px 20px rgba(0, 0, 0, 0.5)',
			cuatro: '0px 0px 30px rgba(0, 0, 0, 0.5)',
			cinco: '0px 0px 40px rgba(0, 0, 0, 0.5)',
			seis: '0px 0px 50px rgba(0, 0, 0, 0.5)',
			siete: '0px 0px 60px rgba(0, 0, 0, 0.5)',
			ocho: '0px 0px 70px rgba(0, 0, 0, 0.5)',
			nueve: '0px 0px 80px rgba(0, 0, 0, 0.5)',
			diez: '0px 0px 90px rgba(0, 0, 0, 0.5)',
		},
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
  