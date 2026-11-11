export interface NavItem {
    label: string;
    href: string;
    active: boolean;
}

export interface LocaleOption {
    code: string;
    label: string;
}

export interface SharedData {
    name: string;
    locale: {
        current: string;
        label: string;
        action: string;
        options: LocaleOption[];
    };
    navigation: NavItem[];
}
