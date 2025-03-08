export interface WidgetAssistant {
  title: string;
  subtitle: string;
  icon?: string;
  colorClass?: string;
  items: {
    order: number;
    value: string;
  }[];
  button?: {
    action: string;
    icon: string;
  },
  completed?: boolean;
}
