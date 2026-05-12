# @fococero/ui

FocoCero Design System - Paquete de componentes UI para React y React Native.

## Descripcion

`@fococero/ui` es el sistema de diseño centralizado de FocoCero, proporcionando componentes reutilizables, accesibles y listos para produccion para todas las aplicaciones del ecosistema.

## Requisitos Previos

Este paquete requiere las siguientes dependencias peer:

```json
{
  "react": "^18.0.0",
  "react-native": "^0.73.0"
}
```

Asegurate de tenerlas instaladas en tu proyecto:

```bash
npm install react react-native
```

## Instalacion

### Instalacion Local (Desarrollo)

Para usar este paquete en desarrollo dentro del monorepo, puedes referenciarlo directamente:

```bash
# En tu package.json
"@fococero/ui": "file:../path/to/shared/ui"
```

### Instalacion desde NPM (Producción)

```bash
npm install @fococero/ui
```

## Uso Rapido

### Importar Componentes

```tsx
// Importar componentes individuales
import { Button, Input } from '@fococero/ui';

// Importar componentes de layouts
import { PageLayout, FlexContainer } from '@fococero/ui';

// Importar componentes moleculares
import { Card, Modal } from '@fococero/ui';
```

### Ejemplos de Uso

#### Botón Basico

```tsx
import { Button } from '@fococero/ui';

const MyComponent = () => (
  <Button
    label="Click me"
    onPress={() => console.log('Clicked!')}
    variant="primary"
  />
);
```

#### Input con Validacion

```tsx
import { Input } from '@fococero/ui';

const LoginForm = () => (
  <Input
    value={email}
    onChangeText={setEmail}
    placeholder="Enter your email"
    secureTextEntry={false}
  />
);
```

#### Card con Contenido

```tsx
import { Card } from '@fococero/ui';

const ProductCard = () => (
  <Card
    title="Product Name"
    description="Product description here"
    action={{ label: 'Buy Now', onPress: handleBuy }}
  />
);
```

#### Layout de Pagina

```tsx
import { PageLayout, FlexContainer } from '@fococero/ui';

const HomePage = () => (
  <PageLayout title="Home" showBackButton={false}>
    <FlexContainer direction="column" gap={16}>
      <Card title="Welcome" />
      <Card title="Features" />
    </FlexContainer>
  </PageLayout>
);
```

## Estructura de Componentes

### Atoms

Componentes basicos que no dependen de otros componentes:

- **Button** - Componente de boton con variantes
- **Input** - Campo de entrada de texto
- **Typography** - Componente de texto con variantes

### Molecules

Componentes compuestos que combinan atoms:

- **Card** - Tarjeta con titulo, descripcion y accion
- **Modal** - Dialogo modal con acciones

### Layouts

Componentes de estructura y layout:

- **PageLayout** - Contenedor principal de pagina
- **FlexContainer** - Contenedor flexible para layouts

## TypeScript

Este paquete está escrito en TypeScript y proporciona tipos completos:

```tsx
import type { ButtonProps, InputProps, CardProps } from '@fococero/ui';
```

## Contribucion

Para contribuir al design system:

1. Agrega nuevos componentes en la carpeta correspondiente (atoms/molecules/layouts)
2. Exporta los nuevos componentes en el archivo barrel de su carpeta
3. Actualiza el archivo `index.ts` principal
4. Agrega documentación en este README

## Licencia

MIT License - FocoCero Team

## Version

1.0.0