**Role (Rol)**: Haz clic en la opción **"Yes, Coding"** (Sí, programando). Esto le indica a Auth0 que tú estarás escribiendo el código, por lo que adaptará la interfaz para mostrarte fragmentos de código y herramientas de desarrollo más adelante.

**Advanced Settings (Ajustes avanzados): Puedes dejar la casilla desmarcada.** Auth0 te asignará automáticamente un servidor en Estados Unidos (que es rapidísimo para pruebas) y un nombre aleatorio para tu dominio (ej. dev-abc1234.us.auth0.com). Para nuestra cápsula, eso es más que suficiente.

Haz clic en el botón azul "NEXT".

¡Y listo! Al hacer clic, entrarás oficialmente al panel principal (Dashboard) de Auth0.

Una vez dentro, retomamos nuestra Fase 2:

En el menú lateral izquierdo, ve a **Applications** y luego haz clic nuevamente en Applications.

Presiona el botón + **Create Application**.

Ponle un nombre como Portal Clinico y selecciona **Single Page Web Applications** (¡muy importante!).

Haz clic en Create.

Ve a la pestaña **Settings** de tu nueva aplicación.

Copia y guarda tu **Domain** y tu **Client ID** (están casi al principio).

Baja un poco en esa misma pantalla hasta encontrar las secciones **Allowed Callback URLs**, **Allowed Logout URLs** y **Allowed Web Origins**. En las tres cajas de texto, pega la dirección de tu servidor local (por ejemplo: **http://localhost:5500**).

Ve al final de la página y presiona **Save Changes**.