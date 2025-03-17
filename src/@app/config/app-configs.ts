import { mergeDeep } from '../utils/merge-deep';
import {
  AppColorScheme,
  AppConfig,
  AppConfigName,
  AppConfigs,
  AppTheme
} from './app-config.interface';
import { deepClone } from '../utils/deep-clone';
import { colorVariables as defaultColorVariables } from './color-variables';

const baseConfig: AppConfig = {
  id: AppConfigName.apollo,
  name: 'Apollo',
  bodyClass: 'app-layout-apollo',
  style: {
    themeClassName: AppTheme.DEFAULT,
    colorScheme: AppColorScheme.LIGHT,
    borderRadius: {
      value: 0.5,
      unit: 'rem'
    },
    button: {
      borderRadius: {
        value: 9999,
        unit: 'px'
      }
    }
  },
  direction: 'ltr',
  imgSrc: 'assets/img/layouts/apollo.png',
  layout: 'horizontal',
  boxed: false,
  sidenav: {
    title: 'APP',
    imageUrl: 'assets/img/logo/logo.svg',
    showCollapsePin: true,
    user: {
      visible: true
    },
    search: {
      visible: true
    },
    state: 'expanded'
  },
  toolbar: {
    fixed: true,
    user: {
      visible: true
    }
  },
  navbar: {
    position: 'below-toolbar'
  },
  footer: {
    visible: true,
    fixed: true
  },
  theme: {
    colors: {
      primary: 'indigo',
      accent: 'blue',
      warn: 'red',
      background: 'gray',
      palettes: defaultColorVariables
    },
    layouts: {
      available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
      default: "apollo",
      configs: {}
    }
  }
};

export const appConfigs: AppConfigs = {
  apollo: baseConfig,
  poseidon: mergeDeep(deepClone(baseConfig), {
    id: AppConfigName.poseidon,
    name: 'Poseidon',
    bodyClass: 'app-layout-poseidon',
    imgSrc: 'assets/img/layouts/poseidon.png',
    style: {
      colorScheme: AppColorScheme.DARK,
    },
    sidenav: {
      user: {
        visible: true
      },
      search: {
        visible: true
      }
    },
    toolbar: {
      user: {
        visible: false
      }
    },
    theme: {
      layouts: {
        default: "poseidon"
      }
    }
  }),
  hermes: mergeDeep(deepClone(baseConfig), {
    id: AppConfigName.hermes,
    name: 'Hermes',
    bodyClass: 'app-layout-hermes',
    imgSrc: 'assets/img/layouts/hermes.png',
    layout: 'vertical',
    boxed: true,
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    footer: {
      fixed: false
    },
    theme: {
      layouts: {
        default: "hermes"
      }
    }
  }),
  ares: mergeDeep(deepClone(baseConfig), {
    id: AppConfigName.ares,
    name: 'Ares',
    bodyClass: 'app-layout-ares',
    imgSrc: 'assets/img/layouts/ares.png',
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    navbar: {
      position: 'in-toolbar'
    },
    footer: {
      fixed: false
    },
    theme: {
      layouts: {
        default: "ares"
      }
    }
  }),
  zeus: mergeDeep(deepClone(baseConfig), {
    id: AppConfigName.zeus,
    name: 'Zeus',
    bodyClass: 'app-layout-zeus',
    imgSrc: 'assets/img/layouts/zeus.png',
    sidenav: {
      state: 'collapsed'
    },
    theme: {
      layouts: {
        default: "zeus"
      }
    }
  }),
  ikaros: mergeDeep(deepClone(baseConfig), {
    id: AppConfigName.ikaros,
    name: 'Ikaros',
    bodyClass: 'app-layout-ikaros',
    imgSrc: 'assets/img/layouts/ikaros.png',
    layout: 'vertical',
    boxed: true,
    sidenav: {
      user: {
        visible: false
      },
      search: {
        visible: false
      }
    },
    toolbar: {
      fixed: false
    },
    navbar: {
      position: 'in-toolbar'
    },
    footer: {
      fixed: false
    },
    theme: {
      layouts: {
        default: "ikaros"
      }
    }
  })
};
