export type Lang = 'es' | 'en'

// ── DICCIONARIO ────────────────────────────────────────────────────────────────
const dict = {
  es: {
    common: {
      loading:    'Cargando...',
      error:      'Error',
      save:       'Guardar',
      cancel:     'Cancelar',
      delete:     'Eliminar',
      edit:       'Editar',
      back:       'Volver',
      search:     'Buscar',
      noResults:  'Sin resultados',
      yes:        'Sí',
      no:         'No',
      actions:    'Acciones',
      close:      'Cerrar',
      confirm:    'Confirmar',
    },
    sidebar: {
      // Admin
      dashboard:  'Dashboard',
      students:   'Alumnos',
      content:    'Contenido',
      reports:    'Reportes',
      settings:   'Configuración',
      // Alumno
      myProgress: 'Mi Progreso',
      mySubjects: 'Mis Materias',
      grades:     'Calificaciones',
      certificate:'Constancia',
      myProfile:  'Mi Perfil',
      // Roles
      admin:      'Administrador',
      student:    'Alumno',
      // Acciones
      signOut:    'Cerrar sesión',
    },
    header: {
      adminPortal:   'Panel de Administración',
      studentPortal: 'Mi Portal de Estudios',
      openMenu:      'Abrir menú',
    },
    auth: {
      signIn:            'Iniciar sesión',
      signingIn:         'Iniciando sesión...',
      email:             'Correo electrónico',
      password:          'Contraseña',
      emailPlaceholder:  'correo@ejemplo.com',
      passwordPlaceholder:'••••••••',
      forgotPassword:    '¿Olvidaste tu contraseña?',
      continueText:      'Inicia sesión para continuar',
      tagline:           'Tu Prepa en 6 meses — Válida en México y USA',
      platformDesc:      'Plataforma de educación 100% en línea',
      contactAdmin:      '¿Problemas para acceder? Contacta a tu administrador.',
      errInvalidCreds:   'Credenciales incorrectas. Verifica tu correo y contraseña.',
      errNoUser:         'No se pudo obtener la información del usuario.',
      errNoProfile:      'No se encontró el perfil de usuario. Contacta al administrador.',
      errUnexpected:     'Ocurrió un error inesperado. Intenta de nuevo.',
      // Recuperar contraseña
      forgotTitle:       'Recuperar contraseña',
      forgotDesc:        'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
      sendLink:          'Enviar enlace de recuperación',
      sending:           'Enviando...',
      emailSentTitle:    '¡Correo enviado!',
      emailSentDesc:     'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      checkSpam:         'Revisa también tu carpeta de spam.',
      backToLogin:       'Volver al login',
      // Nueva contraseña
      resetTitle:        'Nueva contraseña',
      resetDesc:         'Escribe tu nueva contraseña. Mínimo 6 caracteres.',
      newPassword:       'Nueva contraseña',
      newPasswordMin:    'Mínimo 6 caracteres',
      confirmPassword:   'Confirmar contraseña',
      repeatPassword:    'Repite tu nueva contraseña',
      changePassword:    'Cambiar contraseña',
      updating:          'Actualizando...',
      passwordsMatch:    '✓ Las contraseñas coinciden',
      passwordsNoMatch:  '✗ Las contraseñas no coinciden',
      strengthVeryShort: 'Muy corta',
      strengthOk:        'Aceptable',
      strengthGood:      'Buena',
      strengthStrong:    'Muy segura',
      resetSuccess:      'Contraseña actualizada',
      resetSuccessDesc:  'Tu contraseña se cambió correctamente. Ya puedes iniciar sesión.',
      goToLogin:         'Ir al login',
    },
    dashboard: {
      welcome:       'Bienvenido',
      totalStudents: 'Total de alumnos',
      activeStudents:'Alumnos activos',
      progress:      'Progreso',
    },
    subjects: {
      subject:    'Materia',
      week:       'Semana',
      content:    'Contenido',
      evaluation: 'Evaluación',
      start:      'Empezar',
      continue:   'Continuar',
      completed:  'Completada',
      locked:     'Bloqueada',
      month:      'Mes',
    },
    grades: {
      average:  'Promedio',
      grade:    'Calificación',
      status:   'Estado',
      approved: 'Aprobada',
      failed:   'Reprobada',
    },
    certificate: {
      download:      'Descargar Constancia',
      notAvailable:  'Constancia no disponible aún',
      completeAll:   'Completa todas las materias para obtener tu constancia.',
    },
    profile: {
      editProfile:    'Editar Perfil',
      fullName:       'Nombre completo',
      currentPassword:'Contraseña actual',
      newPassword:    'Nueva contraseña',
      saveChanges:    'Guardar cambios',
      saving:         'Guardando...',
    },
    notFound: {
      title:    'Página no encontrada',
      desc:     'La página que buscas no existe o fue movida.',
      desc2:    'Verifica la URL o regresa al inicio.',
      goHome:   'Volver al inicio',
      signIn:   'Iniciar sesión',
    },
    admin: {
      addStudent:    'Agregar alumno',
      editStudent:   'Editar alumno',
      deleteStudent: 'Eliminar alumno',
      resetPassword: 'Restablecer contraseña',
      plan:          'Plan',
      active:        'Activo',
      inactive:      'Inactivo',
      enrolledAt:    'Inscrito',
      searchStudents:'Buscar alumnos...',
    },
  },

  en: {
    common: {
      loading:    'Loading...',
      error:      'Error',
      save:       'Save',
      cancel:     'Cancel',
      delete:     'Delete',
      edit:       'Edit',
      back:       'Back',
      search:     'Search',
      noResults:  'No results',
      yes:        'Yes',
      no:         'No',
      actions:    'Actions',
      close:      'Close',
      confirm:    'Confirm',
    },
    sidebar: {
      // Admin
      dashboard:  'Dashboard',
      students:   'Students',
      content:    'Content',
      reports:    'Reports',
      settings:   'Settings',
      // Student
      myProgress: 'My Progress',
      mySubjects: 'My Subjects',
      grades:     'Grades',
      certificate:'Certificate',
      myProfile:  'My Profile',
      // Roles
      admin:      'Administrator',
      student:    'Student',
      // Actions
      signOut:    'Sign out',
    },
    header: {
      adminPortal:   'Administration Panel',
      studentPortal: 'My Study Portal',
      openMenu:      'Open menu',
    },
    auth: {
      signIn:            'Sign in',
      signingIn:         'Signing in...',
      email:             'Email address',
      password:          'Password',
      emailPlaceholder:  'email@example.com',
      passwordPlaceholder:'••••••••',
      forgotPassword:    'Forgot your password?',
      continueText:      'Sign in to continue',
      tagline:           'Your Diploma in 6 months — Valid in Mexico & USA',
      platformDesc:      '100% online education platform',
      contactAdmin:      'Having trouble? Contact your administrator.',
      errInvalidCreds:   'Invalid credentials. Check your email and password.',
      errNoUser:         'Could not retrieve user information.',
      errNoProfile:      'User profile not found. Contact your administrator.',
      errUnexpected:     'An unexpected error occurred. Please try again.',
      // Forgot password
      forgotTitle:       'Reset password',
      forgotDesc:        'Enter your email and we will send you a reset link.',
      sendLink:          'Send reset link',
      sending:           'Sending...',
      emailSentTitle:    'Email sent!',
      emailSentDesc:     'If the email is registered, you will receive a reset link.',
      checkSpam:         'Also check your spam folder.',
      backToLogin:       'Back to login',
      // New password
      resetTitle:        'New password',
      resetDesc:         'Enter your new password. Minimum 6 characters.',
      newPassword:       'New password',
      newPasswordMin:    'Minimum 6 characters',
      confirmPassword:   'Confirm password',
      repeatPassword:    'Repeat your new password',
      changePassword:    'Change password',
      updating:          'Updating...',
      passwordsMatch:    '✓ Passwords match',
      passwordsNoMatch:  '✗ Passwords do not match',
      strengthVeryShort: 'Too short',
      strengthOk:        'Acceptable',
      strengthGood:      'Good',
      strengthStrong:    'Very strong',
      resetSuccess:      'Password updated',
      resetSuccessDesc:  'Your password was changed successfully. You can now sign in.',
      goToLogin:         'Go to login',
    },
    dashboard: {
      welcome:       'Welcome',
      totalStudents: 'Total students',
      activeStudents:'Active students',
      progress:      'Progress',
    },
    subjects: {
      subject:    'Subject',
      week:       'Week',
      content:    'Content',
      evaluation: 'Evaluation',
      start:      'Start',
      continue:   'Continue',
      completed:  'Completed',
      locked:     'Locked',
      month:      'Month',
    },
    grades: {
      average:  'Average',
      grade:    'Grade',
      status:   'Status',
      approved: 'Passed',
      failed:   'Failed',
    },
    certificate: {
      download:      'Download Certificate',
      notAvailable:  'Certificate not available yet',
      completeAll:   'Complete all subjects to obtain your certificate.',
    },
    profile: {
      editProfile:    'Edit Profile',
      fullName:       'Full name',
      currentPassword:'Current password',
      newPassword:    'New password',
      saveChanges:    'Save changes',
      saving:         'Saving...',
    },
    notFound: {
      title:    'Page not found',
      desc:     'The page you are looking for does not exist or was moved.',
      desc2:    'Check the URL or go back to home.',
      goHome:   'Go home',
      signIn:   'Sign in',
    },
    admin: {
      addStudent:    'Add student',
      editStudent:   'Edit student',
      deleteStudent: 'Delete student',
      resetPassword: 'Reset password',
      plan:          'Plan',
      active:        'Active',
      inactive:      'Inactive',
      enrolledAt:    'Enrolled',
      searchStudents:'Search students...',
    },
  },
} as const

// ── TIPOS ──────────────────────────────────────────────────────────────────────
type Dict = typeof dict.es

// Genera unión de claves con notación de punto: 'common.loading' | 'sidebar.dashboard' | …
type DotKeys<T, P extends string = ''> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DotKeys<T[K], `${P}${K & string}.`>
    : `${P}${K & string}`
}[keyof T]

export type TKey = DotKeys<Dict>

// ── FUNCIÓN DE TRADUCCIÓN ──────────────────────────────────────────────────────
export function getT(lang: Lang) {
  return function t(key: TKey): string {
    const parts = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = dict[lang]
    for (const part of parts) {
      if (node && typeof node === 'object' && part in node) {
        node = node[part]
      } else {
        // Fallback a español
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = dict.es
        for (const p of parts) fallback = fallback?.[p]
        return typeof fallback === 'string' ? fallback : key
      }
    }
    return typeof node === 'string' ? node : key
  }
}

// ── UTILIDAD PARA URLs DE RECURSOS BILINGÜE ────────────────────────────────────
/**
 * Devuelve la URL del recurso en el idioma activo.
 * Si no existe la versión en el idioma solicitado, usa la URL de fallback.
 *
 * @example
 * localizeUrl({ es: videoEspañolUrl, en: videoInglesUrl }, lang)
 */
export function localizeUrl(
  urls: { es?: string | null; en?: string | null },
  lang: Lang,
): string | null {
  return urls[lang] ?? urls.es ?? urls.en ?? null
}
