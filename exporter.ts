@import "tailwindcss";

@layer base {
  body {
    @apply bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-500 selection:text-white;
  }
}

/* Custom scrollbar for dark cyberpunk theme */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #020617;
}

::-webkit-scrollbar-thumb {
  background: #1e1b4b;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4338ca;
}
