# POC (Prova de Conceito) - Sistema de Orçamentos para Jardinagem

Prova de Conceito desenvolvida para o aplicativo de **orçamentos de jardinagem**. Este processo é importante para verificar a compatibilidade da **API Google Maps** (Imagens de satélite) com sistemas de **criação de vetores** e **extração de área** (m²) para cálculos de orçamento.

## Utilização de API

Para que as imagens de satélite renderizem, é necessário cadastrar uma chave **API Google Maps**. Acesse o arquivo .env.example para acessar o modelo **.env**, que deve ser criado para criar sincronizar sua **API Maps** com o projeto. 
 
 Para gerar a API, Clique em **"Create your account"**:
https://mapsplatform.google.com/lp/maps-apis/

## Stack
### Core e Plataforma
-  React Native  (`0.86.3`)
-   React  (`19.2.3`)
-   Expo SDK 57  (`expo: ~57.0.22`,  `expo-dev-client: ~57.0.19`)
-   TypeScript  (`~6.0.3`)

### Mapas e localização
-   `react-native-maps`: Exibição e interação com mapas (Google Maps no Android configurado dinamicamente via
    app.config.js).
-   `expo-location`: Obtenção da localização do usuário e permissões de GPS.

### Cálculos Geoespaciais: 

-   `@turf/area`  e  `@turf/helpers`: Cálculo e processamento da área em m² de polígonos desenhados no mapa.

### Testes
- tsx executando testes com o runner de testes do Node.js. 

## Comandos apara iniciar

- Instalar dependências: **npm install**
- Iniciar servidor de desenvolvimento (Metro Bundler): **npm start** ou **npm expo start**
- Iniciar testes unitários: **npm test**
# Atenção!
Para que a **aplicação** funcione corretamente com a **API**, é necessário gerar a **Development Build**. Com o seu **celular** conectado via **USB** (Com depuração ativada) ou emulador **Android Studio**: 
utilize **npx expo run: android** ou **npm run android**

### IOS (Requer macOS com Xcode):

utilize **npm run ios** ou **npx expo run:ios**



