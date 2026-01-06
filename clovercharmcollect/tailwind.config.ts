import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Rarity Colors
				common: {
					DEFAULT: 'hsl(var(--common))',
					accent: 'hsl(var(--common-accent))',
					glow: 'hsl(var(--common-glow))'
				},
				uncommon: {
					DEFAULT: 'hsl(var(--uncommon))',
					accent: 'hsl(var(--uncommon-accent))',
					glow: 'hsl(var(--uncommon-glow))'
				},
				rare: {
					DEFAULT: 'hsl(var(--rare))',
					accent: 'hsl(var(--rare-accent))',
					glow: 'hsl(var(--rare-glow))'
				},
				epic: {
					DEFAULT: 'hsl(var(--epic))',
					accent: 'hsl(var(--epic-accent))',
					glow: 'hsl(var(--epic-glow))'
				},
				'really-rare': {
					DEFAULT: 'hsl(var(--really-rare))',
					accent: 'hsl(var(--really-rare-accent))',
					glow: 'hsl(var(--really-rare-glow))'
				},
				'super-rare': {
					DEFAULT: 'hsl(var(--super-rare))',
					accent: 'hsl(var(--super-rare-accent))',
					glow: 'hsl(var(--super-rare-glow))'
				},
				legendary: {
					DEFAULT: 'hsl(var(--legendary))',
					accent: 'hsl(var(--legendary-accent))',
					glow: 'hsl(var(--legendary-glow))'
				},
				mythical: {
					DEFAULT: 'hsl(var(--mythical))',
					accent: 'hsl(var(--mythical-accent))',
					glow: 'hsl(var(--mythical-glow))'
				},
				magical: {
					DEFAULT: 'hsl(var(--magical))',
					accent: 'hsl(var(--magical-accent))',
					glow: 'hsl(var(--magical-glow))'
				},
				ethereal: {
					DEFAULT: 'hsl(var(--ethereal))',
					accent: 'hsl(var(--ethereal-accent))',
					glow: 'hsl(var(--ethereal-glow))'
				},
				diamond: {
					DEFAULT: 'hsl(var(--diamond))',
					accent: 'hsl(var(--diamond-accent))',
					glow: 'hsl(var(--diamond-glow))'
				},
				sparkle: 'hsl(var(--sparkle))',
				'clover-glow': 'hsl(var(--clover-glow))'
			},
			backgroundImage: {
				'gradient-common': 'var(--gradient-common)',
				'gradient-uncommon': 'var(--gradient-uncommon)',
				'gradient-rare': 'var(--gradient-rare)',
				'gradient-epic': 'var(--gradient-epic)',
				'gradient-really-rare': 'var(--gradient-really-rare)',
				'gradient-super-rare': 'var(--gradient-super-rare)',
				'gradient-legendary': 'var(--gradient-legendary)',
				'gradient-mythical': 'var(--gradient-mythical)',
				'gradient-magical': 'var(--gradient-magical)',
				'gradient-ethereal': 'var(--gradient-ethereal)',
				'gradient-diamond': 'var(--gradient-diamond)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'magical': 'var(--shadow-magical)',
				'rare': 'var(--shadow-rare)'
			},
			transitionTimingFunction: {
				'magical': 'cubic-bezier(0.23, 1, 0.32, 1)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'sparkle': {
					'0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
					'50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
					'100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px currentColor' },
					'50%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' }
				},
				'draw-reveal': {
					'0%': { transform: 'scale(0.8) rotateY(180deg)', opacity: '0' },
					'50%': { transform: 'scale(1.1) rotateY(90deg)', opacity: '0.5' },
					'100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' }
				},
				'clover-bounce': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-5px) rotate(5deg)' },
					'75%': { transform: 'translateY(-2px) rotate(-5deg)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-100% 0' },
					'100%': { backgroundPosition: '100% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'sparkle': 'sparkle 1.5s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'draw-reveal': 'draw-reveal 0.8s ease-out',
				'clover-bounce': 'clover-bounce 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
