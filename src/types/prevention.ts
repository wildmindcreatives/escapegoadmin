export interface PreventionMessage {
  id: string
  title: string
  subtitle: string | null
  icon_name: string
  icon_color: string
  background_color: string
  main_message: string
  button_text: string
  advice_1_icon: string | null
  advice_1_icon_color: string | null
  advice_1_text: string | null
  advice_2_icon: string | null
  advice_2_icon_color: string | null
  advice_2_text: string | null
  advice_3_icon: string | null
  advice_3_icon_color: string | null
  advice_3_text: string | null
  advice_4_icon: string | null
  advice_4_icon_color: string | null
  advice_4_text: string | null
  advice_5_icon: string | null
  advice_5_icon_color: string | null
  advice_5_text: string | null
  footer_message: string | null
  is_active: boolean
  priority: number
  valid_from: string | null
  valid_until: string | null
  show_once_per_day: boolean
  show_once_per_session: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface PreventionMessageFormData {
  title: string
  subtitle?: string
  icon_name: string
  icon_color: string
  background_color: string
  main_message: string
  button_text: string
  advice_1_icon?: string
  advice_1_icon_color?: string
  advice_1_text?: string
  advice_2_icon?: string
  advice_2_icon_color?: string
  advice_2_text?: string
  advice_3_icon?: string
  advice_3_icon_color?: string
  advice_3_text?: string
  advice_4_icon?: string
  advice_4_icon_color?: string
  advice_4_text?: string
  advice_5_icon?: string
  advice_5_icon_color?: string
  advice_5_text?: string
  footer_message?: string
  is_active: boolean
  priority: number
  valid_from?: string
  valid_until?: string
  show_once_per_day: boolean
  show_once_per_session: boolean
}
