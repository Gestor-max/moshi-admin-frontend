import React, { createContext, useContext, useState } from 'react';

export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Navigation / Header
    nav_dashboard: "Panel Principal",
    nav_profiles: "Perfiles",
    nav_proxies: "Proxies",
    nav_locations: "Ubicaciones",
    nav_websites: "Sitios Web",
    nav_linked: "Vínculos",
    nav_automations: "Automatizaciones",
    logout: "Cerrar Sesión",

    // Locations
    locations_title: "Gestión de Ubicaciones",
    locations_subtitle: "Administra estados y ubicaciones para asignar a tus perfiles.",
    new_location: "Nueva Ubicación",
    edit_location: "Editar Ubicación",
    state_label: "Estado / Provincia",
    location_label: "Ciudad / Ubicación",
    
    // Actions & General Buttons
    create: "Crear",
    save: "Guardar",
    saveChanges: "Guardar Cambios",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    search: "Buscar",
    loading: "Cargando...",
    actions: "Acciones",
    back: "Volver",
    link: "Vincular",
    no_results: "No se encontraron elementos.",
    password: "Contraseña",
    
    // Dashboard
    dashboard_title: "Panel de Inicio",
    dashboard_welcome: "Bienvenido",
    dashboard_loading_stats: "Cargando estadísticas...",
    dashboard_users: "Usuarios Totales",
    dashboard_profiles: "Perfiles",
    dashboard_proxies: "Proxies",
    dashboard_websites: "Sitios Web",
    dashboard_accounts: "cuentas",
    dashboard_quick_actions: "Acciones Rápidas",
    dashboard_new_profile: "Nuevo Perfil",
    dashboard_new_proxy: "Nuevo Proxy",
    dashboard_linked_profiles: "Perfiles Vinculados",
    dashboard_website_catalog: "Catálogo Sitios Web",

    // Linked Profiles
    linked_title: "Perfiles Vinculados a Sitios Web",
    linked_subtitle_admin: "Administración global: Visualizando cuentas vinculadas de TODOS los usuarios.",
    linked_subtitle_user: "Administración de cuentas vinculadas a tus perfiles de usuario.",
    linked_link_account: "Vincular Cuenta a Perfil",
    linked_modal_title: "Vincular Cuenta a Perfil",
    linked_modal_edit_title: "Editar Cuenta Vinculada",
    linked_search_placeholder: "Buscar por perfil, sitio web o correo...",
    linked_empty_title: "No hay perfiles vinculados a sitios web",
    linked_empty_text: "Vincúla tus perfiles con las plataformas de redes/sitios web agregando credenciales o cookies.",
    linked_new_link: "Vincular Nueva Cuenta",
    linked_select_profile: "Selecciona Perfil",
    linked_select_website: "Selecciona Sitio Web",
    linked_email_label: "Correo / Usuario en el Sitio Web",
    linked_password_label: "Contraseña en el Sitio Web",
    linked_cookie_label: "Cookie de Sesión (Opcional)",
    linked_save_link: "Guardar Vinculación",
    linked_update_account: "Actualizar Cuenta",
    linked_note_one_account: "Nota: Solo se permite 1 cuenta por sitio web para cada perfil.",

    // Profiles Module
    profiles_title: "Gestión de Perfiles",
    profiles_subtitle: "Administra tus identidades digitales, credenciales y vinculaciones a sitios web.",
    profiles_empty_title: "No se encontraron perfiles",
    profiles_empty_text: "Crea tu primer perfil para comenzar a estructurar tus operaciones.",
    new_profile: "Crear Nuevo Perfil",
    edit_profile: "Editar Perfil",
    tab_basic: "Básica *",
    tab_credentials: "Credenciales",
    tab_employment: "Empleo",
    tab_education: "Educación",
    tab_location: "Ubicación",
    
    // Basic Info
    name: "Nombre",
    lastname: "Apellido",
    username: "Nombre de Usuario",
    website: "Sitio Web",
    pronouns: "Pronombres",
    company_basic: "Empresa",
    location_basic: "Ubicación",
    profile_credential: "Credencial del Perfil",
    topic_about_you: "Temas sobre ti",
    social_accounts: "Cuentas de Redes (JSON)",
    description_html: "Descripción HTML",
    gender: "Género",
    gender_m: "Masculino (M)",
    gender_f: "Femenino (F)",
    gender_o: "Otro (O)",
    country_iso: "País ISO",
    day_nac: "Día Nacimiento",
    mes_nac: "Mes Nacimiento",
    year_nac: "Año Nacimiento",
    time_zone: "Zona Horaria",
    proxy_assigned: "Proxy Asociado",
    bio_simple: "Biografía Simple",
    
    // Employment Info
    position: "Cargo / Puesto",
    company_org: "Empresa / Organización",
    start_year: "Año Inicio",
    end_year: "Año Fin",
    currently_work_here: "Trabajo actualmente aquí",

    // Education Info
    school: "Escuela / Universidad",
    primary_major: "Carrera Principal",
    secondary_major: "Carrera Secundaria",
    degree_type: "Tipo de Grado",
    graduation_year: "Año de Graduación",

    // Location Info
    location: "Ubicación",
    currently_live_here: "Resido actualmente aquí",

    // Proxies Module
    proxies_title: "Gestión de Proxies",
    proxies_subtitle: "Administra tus proxies configurados",
    proxies_empty_title: "No se encontraron proxies",
    new_proxy: "Nuevo Proxy",
    import_string: "Importar por String",
    manual_form: "Formulario Manual",
    proxy_string_label: "Proxy String (IP:Puerto:Usuario:Contraseña)",
    user_label: "Usuario",
    no_user: "Sin usuario",
    no_cookie: "Sin Cookie",

    // Automations Module
    automations_title: "Automatizaciones de Bot",
    automations_subtitle: "Ejecuta y administra los bots de automatización disponibles.",
    automations_empty_title: "No hay automatizaciones disponibles",
    automations_run: "Ejecutar Bot",
  },
  en: {
    // Navigation / Header
    nav_dashboard: "Dashboard",
    nav_profiles: "Profiles",
    nav_proxies: "Proxies",
    nav_websites: "Websites",
    nav_linked: "Linked Profiles",
    nav_automations: "Automations",
    logout: "Log Out",
    
    // Actions & General Buttons
    create: "Create",
    save: "Save",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    loading: "Loading...",
    actions: "Actions",
    back: "Back",
    link: "Link",
    no_results: "No items found.",
    password: "Password",
    
    // Dashboard
    dashboard_title: "Home Dashboard",
    dashboard_welcome: "Welcome",
    dashboard_loading_stats: "Loading statistics...",
    dashboard_users: "Total Users",
    dashboard_profiles: "Profiles",
    dashboard_proxies: "Proxies",
    dashboard_websites: "Websites",
    dashboard_accounts: "accounts",
    dashboard_quick_actions: "Quick Actions",
    dashboard_new_profile: "New Profile",
    dashboard_new_proxy: "New Proxy",
    dashboard_linked_profiles: "Linked Profiles",
    dashboard_website_catalog: "Websites Catalog",

    // Linked Profiles
    linked_title: "Profiles Linked to Websites",
    linked_subtitle_admin: "Global Admin: Viewing linked accounts for ALL users.",
    linked_subtitle_user: "Management of accounts linked to your user profiles.",
    linked_link_account: "Link Account to Profile",
    linked_modal_title: "Link Account to Profile",
    linked_modal_edit_title: "Edit Linked Account",
    linked_search_placeholder: "Search by profile, website, or email...",
    linked_empty_title: "No profiles linked to websites yet",
    linked_empty_text: "Link your profiles with social platforms/websites by adding credentials or cookies.",
    linked_new_link: "Link New Account",
    linked_select_profile: "Select Profile",
    linked_select_website: "Select Website",
    linked_email_label: "Email / Username on Website",
    linked_password_label: "Password on Website",
    linked_cookie_label: "Session Cookie (Optional)",
    linked_save_link: "Save Account Link",
    linked_update_account: "Update Account",
    linked_note_one_account: "Note: Only 1 account per website is allowed for each profile.",

    // Profiles Module
    profiles_title: "Profile Management",
    profiles_subtitle: "Manage digital identities, credentials, and website accounts.",
    profiles_empty_title: "No profiles found",
    profiles_empty_text: "Create your first profile to start structuring your operations.",
    new_profile: "Create New Profile",
    edit_profile: "Edit Profile",
    tab_basic: "Basic *",
    tab_credentials: "Credentials",
    tab_employment: "Employment",
    tab_education: "Education",
    tab_location: "Location",

    // Basic Info
    name: "First Name",
    lastname: "Last Name",
    username: "Username",
    website: "Website",
    pronouns: "Pronouns",
    company_basic: "Company",
    location_basic: "Location",
    profile_credential: "Profile Credential",
    topic_about_you: "Topics About You",
    social_accounts: "Social Accounts (JSON)",
    description_html: "Description HTML",
    gender: "Gender",
    gender_m: "Male (M)",
    gender_f: "Female (F)",
    gender_o: "Other (O)",
    country_iso: "Country ISO",
    day_nac: "Birth Day",
    mes_nac: "Birth Month",
    year_nac: "Birth Year",
    time_zone: "Time Zone",
    proxy_assigned: "Assigned Proxy",
    bio_simple: "Simple Bio",

    // Employment Info
    position: "Position",
    company_org: "Company / Organization",
    start_year: "Start Year",
    end_year: "End Year",
    currently_work_here: "I currently work here",

    // Education Info
    school: "School / University",
    primary_major: "Primary Major",
    secondary_major: "Secondary Major",
    degree_type: "Degree Type",
    graduation_year: "Graduation Year",

    // Location Info
    location: "Location",
    currently_live_here: "I currently live here",

    // Proxies Module
    proxies_title: "Proxy Management",
    proxies_subtitle: "Manage your configured proxies",
    proxies_empty_title: "No proxies found",
    new_proxy: "New Proxy",
    import_string: "Import by String",
    manual_form: "Manual Form",
    proxy_string_label: "Proxy String (IP:Port:Username:Password)",
    user_label: "User",
    no_user: "No user",
    no_cookie: "No Cookie",

    // Automations Module
    automations_title: "Bot Automations",
    automations_subtitle: "Run and manage available automation bots.",
    automations_empty_title: "No automations available",
    automations_run: "Run Bot",
  }
};

type TranslationKey = keyof typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app_language', lang);
    setLanguageState(lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
