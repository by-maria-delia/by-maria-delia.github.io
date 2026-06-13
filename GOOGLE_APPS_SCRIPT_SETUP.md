# 🤖 Scripts de Automatización - Google Apps Script

Estos scripts automatizan el procesamiento de imágenes y el deploy del sitio para María Delia. Solo usuarios con acceso de **Editor** o superior pueden ver los menús y ejecutar las acciones.

---

## ⚙️ Instalación

### Paso 1: Abrir Google Apps Script

1. Abre la hoja de Google Sheets
2. En la parte superior, haz clic en **Extensiones**
3. Haz clic en **Apps Script**

### Paso 2: Crear los archivos del script

En el editor de Apps Script vas a crear **3 archivos** separados. Para crear un archivo nuevo, hacé clic en el **+** junto a "Archivos" en el panel izquierdo y elegí "Script".

| Archivo | Descripción |
|---------|-------------|
| `Permissions.gs` | Control de acceso compartido |
| `Code.gs` | Procesador de imágenes |
| `triggerBuild.gs` | Deploy del sitio web |

Copiá el código de cada sección de este documento en su archivo correspondiente.

### Paso 3: Configurar el token de GitHub (solo para triggerBuild.gs)

Para que el deploy funcione, hay que guardar el token de GitHub de forma segura:

1. En el editor de Apps Script, hacé clic en **Configuración del proyecto** (ícono de engranaje)
2. Bajá hasta la sección **Propiedades del script**
3. Hacé clic en **Agregar propiedad**
4. Nombre: `GITHUB_TOKEN` / Valor: el token de acceso personal de GitHub
5. Guardá

> El token debe tener permiso `workflow` para poder disparar GitHub Actions.

### Paso 4: Guardar y autorizar

1. Guardá todos los archivos (Ctrl+S / Cmd+S)
2. Te pedirá permiso para conectarse a Google Drive y hacer solicitudes externas → Hacé clic en **Autorizar**

### Paso 5: Volver a la hoja

1. Cerrá el editor de Apps Script
2. Volvé a la hoja de Google Sheets y **recargá la página** (F5 o Cmd+R)
3. Si tenés acceso de Editor, deben aparecer los menús:
   - **"🖼️ Procesar Imágenes"**
   - **"🚀 Sitio Web"**

---

## 📝 Cómo usar

### Para **Modelos**:

1. Abre tu carpeta de Drive "Imágenes a Procesar"
2. **Crea una subcarpeta** con el nombre del modelo (ej: `Mariposa`)
3. Sube las fotos del modelo dentro de esa subcarpeta
4. En la hoja, haz clic en **"🖼️ Procesar Imágenes"** → **"Abrir Procesador"**
5. Selecciona **Modelos** y elige el modelo (la carpeta que creaste)
6. Haz clic en **"Procesar"**

### Para **Bolsillos**, **Estampas** o **Galería**:

1. Abre tu carpeta de Drive "Imágenes a Procesar"
2. **Sube las fotos sueltas** directamente en esa carpeta (sin subcarpetas)
3. En la hoja, haz clic en **"🖼️ Procesar Imágenes"** → **"Abrir Procesador"**
4. Selecciona el tipo correspondiente (Bolsillos, Estampas o Galería)
5. Haz clic en **"Procesar"**

### Resultado:
- ⏳ Espera unos segundos por imagen
- ✅ Las fotos aparecen en la carpeta correcta automáticamente
- 🗑️ Las fotos de la carpeta temporal se eliminan solas

### Para **actualizar el sitio web**:

1. En la hoja, haz clic en **"🚀 Sitio Web"** → **"Actualizar sitio"**
2. Confirmá la acción
3. El sitio estará listo en unos minutos

---

## 🛠️ Código

### `Permissions.gs`

Helper compartido que usan los otros scripts para verificar el nivel de acceso del usuario activo. Los menús y funciones solo se habilitan para usuarios con rol **Editor** u **Owner**.

```javascript
// Devuelve true si el usuario activo tiene acceso de Editor o superior
const userCanEdit = () => {
  const file = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  const p = file.getAccess(Session.getActiveUser());
  return p === DriveApp.Permission.EDIT || p === DriveApp.Permission.OWNER;
};
```

---

### `Code.gs`

```javascript
// IDs de carpetas en Google Drive
const FOLDER_IDS = {
  models:  "1GFqc4b_f0AOx77SctLcDIlVSSwSlxkQX",
  gallery: "1A5Wa_M-i2aXM4BCLA-xvLgzzGriQ3Na1",
  stamps:  "1oM-E5h_3KE63q5l3-_x3nYBeVCN6SE2k",
  pockets: "1DFMeP9_eSUcTaHiV-ARux5bT4Tt3eVXI",
  temp:    "199w8MzOtLMdweoAwbGz1tarOTilkbaOI"
};

// Dimensiones requeridas por tipo (null = no redimensionar)
const DIMENSIONS = {
  models:  { width: 626, height: 790 },
  pockets: { width: 615, height: 425 },
  stamps:  null,
  gallery: null
};

function onOpen() {
  if (!userCanEdit()) return;
  SpreadsheetApp.getUi()
    .createMenu("🖼️ Procesar Imágenes")
    .addItem("Abrir Procesador", "showProcessorDialog")
    .addToUi();
}

// Lista las subcarpetas de la carpeta temporal (para el selector de modelos)
const getModelFoldersInTemp = () => {
  const tempFolder = DriveApp.getFolderById(FOLDER_IDS.temp);
  const subfolders = tempFolder.getFolders();
  const names = [];
  while (subfolders.hasNext()) names.push(subfolders.next().getName());
  return names.sort();
};

// Retorna la lista de archivos a procesar (id + nombre)
const getFilesForProcessing = (imageType, modelName) => {
  const tempFolder = DriveApp.getFolderById(FOLDER_IDS.temp);
  let files;

  if (imageType === "models") {
    const subfolders = tempFolder.getFoldersByName(modelName);
    if (!subfolders.hasNext()) return { error: `Carpeta "${modelName}" no encontrada en la carpeta temporal.` };
    files = subfolders.next().getFiles();
  } else {
    files = tempFolder.getFiles();
  }

  const list = [];
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType().startsWith("image/")) {
      list.push({ id: f.getId(), name: f.getName() });
    }
  }

  if (list.length === 0) return { error: "No se encontraron imágenes en la carpeta temporal." };
  return { files: list };
};

// Retorna el contenido de un archivo como base64 para procesarlo en el navegador
const getFileAsBase64 = (fileId) => {
  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  return {
    base64: Utilities.base64Encode(blob.getBytes()),
    mimeType: blob.getContentType(),
    name: file.getName()
  };
};

// Guarda la imagen procesada (base64 PNG) en la carpeta destino correcta
const saveProcessedImage = (imageType, modelName, fileName, base64DataUrl) => {
  try {
    let destFolder;
    if (imageType === "models") {
      const root = DriveApp.getFolderById(FOLDER_IDS.models);
      const existing = root.getFoldersByName(modelName);
      destFolder = existing.hasNext() ? existing.next() : root.createFolder(modelName);
    } else {
      destFolder = DriveApp.getFolderById(FOLDER_IDS[imageType]);
    }

    const pngName = fileName.replace(/\.[^.]+$/, "") + ".png";
    const raw = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");
    const bytes = Utilities.base64Decode(raw);
    const blob = Utilities.newBlob(bytes, "image/png", pngName);
    destFolder.createFile(blob);
    return { success: true };
  } catch (e) {
    return { error: e.toString() };
  }
};

// Elimina el archivo temporal después de procesarlo
const deleteTempFile = (fileId) => {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return { success: true };
  } catch (e) {
    return { error: e.toString() };
  }
};

function showProcessorDialog() {
  if (!userCanEdit()) {
    SpreadsheetApp.getUi().alert("No tenés permisos para usar esta función.");
    return;
  }

  const html = HtmlService.createHtmlOutput(`
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
      .container { background: white; padding: 20px; border-radius: 8px; }
      h2 { margin-top: 0; color: #333; font-size: 16px; }
      label { display: block; margin-top: 14px; font-weight: bold; color: #444; font-size: 13px; }
      select { width: 100%; padding: 9px; margin-top: 4px; font-size: 13px; border: 1px solid #ccc; border-radius: 4px; }
      #btn { width: 100%; padding: 11px; margin-top: 18px; font-size: 14px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
      #btn:hover { background: #45a049; }
      #btn:disabled { background: #aaa; cursor: not-allowed; }
      #progress { display: none; margin-top: 12px; font-size: 13px; color: #555; }
      .error   { color: #c0392b; margin-top: 10px; font-size: 13px; }
      .success { color: #27ae60; margin-top: 10px; font-size: 13px; }
      .bar-bg  { background: #eee; border-radius: 4px; height: 8px; margin-top: 6px; }
      .bar     { background: #4CAF50; border-radius: 4px; height: 8px; width: 0%; transition: width 0.3s; }
    </style>

    <div class="container">
      <h2>🖼️ Procesador de Imágenes</h2>

      <label>Tipo de imagen:</label>
      <select id="imageType" onchange="onTypeChange()">
        <option value="">-- Selecciona un tipo --</option>
        <option value="models">Modelos (626 × 790 px)</option>
        <option value="pockets">Bolsillos (615 × 425 px)</option>
        <option value="stamps">Estampas</option>
        <option value="gallery">Galería</option>
      </select>

      <div id="modelSelectorDiv" style="display:none">
        <label>Modelo:</label>
        <select id="modelName"><option value="">-- Cargando... --</option></select>
      </div>

      <button id="btn" onclick="startProcessing()" disabled>✨ Procesar</button>

      <div id="progress">
        <span id="progressText">Procesando 0 de 0...</span>
        <div class="bar-bg"><div class="bar" id="bar"></div></div>
      </div>
      <div id="message"></div>
    </div>

    <canvas id="canvas" style="display:none"></canvas>

    <script>
      const DIMENSIONS = {
        models:  { width: 626, height: 790 },
        pockets: { width: 615, height: 425 },
        stamps:  null,
        gallery: null
      };

      function onTypeChange() {
        const type = document.getElementById('imageType').value;
        const modelDiv = document.getElementById('modelSelectorDiv');
        const btn = document.getElementById('btn');
        document.getElementById('message').innerHTML = '';

        if (type === 'models') {
          modelDiv.style.display = 'block';
          btn.disabled = true;
          document.getElementById('modelName').innerHTML = '<option value="">-- Cargando... --</option>';
          google.script.run
            .withSuccessHandler(models => {
              const sel = document.getElementById('modelName');
              if (!models.length) {
                sel.innerHTML = '<option value="">-- No hay carpetas de modelos --</option>';
              } else {
                sel.innerHTML = models.map(m => '<option value="' + m + '">' + m + '</option>').join('');
                btn.disabled = false;
              }
            })
            .withFailureHandler(() => {
              document.getElementById('modelName').innerHTML = '<option value="">-- Error al cargar --</option>';
            })
            .getModelFoldersInTemp();
        } else {
          modelDiv.style.display = 'none';
          btn.disabled = !type;
        }
      }

      function startProcessing() {
        const imageType = document.getElementById('imageType').value;
        const modelName = imageType === 'models' ? document.getElementById('modelName').value : null;

        if (!imageType) { showMessage('Selecciona un tipo de imagen', 'error'); return; }
        if (imageType === 'models' && !modelName) { showMessage('Selecciona un modelo', 'error'); return; }

        document.getElementById('btn').disabled = true;
        document.getElementById('message').innerHTML = '';
        showProgress('Obteniendo imágenes...', 0, 0);

        google.script.run
          .withSuccessHandler(result => {
            if (result.error) { showMessage('❌ ' + result.error, 'error'); resetBtn(); return; }
            processFiles(result.files, 0, imageType, modelName);
          })
          .withFailureHandler(err => { showMessage('❌ Error: ' + err, 'error'); resetBtn(); })
          .getFilesForProcessing(imageType, modelName);
      }

      function processFiles(files, index, imageType, modelName) {
        if (index >= files.length) {
          document.getElementById('progress').style.display = 'none';
          showMessage('✅ ¡Listo! Se procesaron ' + files.length + ' imagen(es) correctamente.', 'success');
          resetBtn();
          return;
        }

        const file = files[index];
        showProgress('Procesando ' + (index + 1) + ' de ' + files.length + '...', index + 1, files.length);

        google.script.run
          .withSuccessHandler(data => {
            resizeAndConvert(data, imageType)
              .then(base64DataUrl => {
                google.script.run
                  .withSuccessHandler(saveResult => {
                    if (saveResult.error) { showMessage('❌ Error al guardar: ' + saveResult.error, 'error'); resetBtn(); return; }
                    google.script.run
                      .withSuccessHandler(() => processFiles(files, index + 1, imageType, modelName))
                      .withFailureHandler(() => processFiles(files, index + 1, imageType, modelName))
                      .deleteTempFile(file.id);
                  })
                  .withFailureHandler(err => { showMessage('❌ Error: ' + err, 'error'); resetBtn(); })
                  .saveProcessedImage(imageType, modelName, file.name, base64DataUrl);
              });
          })
          .withFailureHandler(err => { showMessage('❌ Error: ' + err, 'error'); resetBtn(); })
          .getFileAsBase64(file.id);
      }

      function resizeAndConvert(data, imageType) {
        const dims = DIMENSIONS[imageType];
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.getElementById('canvas');
            canvas.width  = dims ? dims.width  : img.width;
            canvas.height = dims ? dims.height : img.height;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = 'data:' + data.mimeType + ';base64,' + data.base64;
        });
      }

      function showProgress(text, current, total) {
        const progressDiv = document.getElementById('progress');
        progressDiv.style.display = 'block';
        document.getElementById('progressText').textContent = text;
        document.getElementById('bar').style.width = (total > 0 ? (current / total * 100) : 0) + '%';
      }

      function showMessage(msg, type) {
        const el = document.getElementById('message');
        el.className = type;
        el.innerHTML = msg;
      }

      function resetBtn() {
        document.getElementById('btn').disabled = false;
      }
    </script>
  `).setWidth(380).setHeight(420);

  SpreadsheetApp.getUi().showModelessDialog(html, "Procesador de Imágenes");
}
```

---

### `triggerBuild.gs`

Dispara el workflow de deploy en GitHub Actions. Requiere un token de GitHub guardado en las propiedades del script (ver instalación).

```javascript
function onOpenTriggerBuild() {
  if (!userCanEdit()) return;
  SpreadsheetApp.getUi()
    .createMenu("🚀 Sitio Web")
    .addItem("Actualizar sitio", "triggerDeploy")
    .addToUi();
}

const triggerDeploy = () => {
  if (!userCanEdit()) {
    SpreadsheetApp.getUi().alert("No tenés permisos para usar esta función.");
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    "¿Actualizar el sitio web?",
    "Esto iniciará un nuevo deploy. El sitio estará listo en unos minutos.",
    ui.ButtonSet.OK_CANCEL
  );
  if (confirm !== ui.Button.OK) return;

  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const response = UrlFetchApp.fetch(
    'https://api.github.com/repos/by-maria-delia/maria-delia-website/actions/workflows/deploy.yml/dispatches',
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      payload: JSON.stringify({ ref: 'main' }),
      muteHttpExceptions: true,
    }
  );

  if (response.getResponseCode() === 204) {
    ui.alert('✅ ¡Sitio actualizado! Los cambios estarán listos en unos minutos.');
  } else {
    ui.alert('❌ Error: ' + response.getContentText());
  }
};
```

> **Nota:** `onOpenTriggerBuild` se llama automáticamente al abrir la hoja porque Apps Script ejecuta todas las funciones con nombre `onOpen*` al inicio. No hace falta llamarla manualmente.

---

## ⚠️ Importante

- Los menús solo son visibles para usuarios con acceso de **Editor** o **Owner**. Los usuarios con acceso de solo lectura no ven nada.
- El script elimina automáticamente los archivos temporales después de procesarlos.
- Para modelos, si el modelo no existe en Drive, el script crea la carpeta automáticamente.
- El token de GitHub **nunca** debe compartirse ni pegarse en el código — siempre guardarlo en las Propiedades del script.

---

## 🆘 Problemas comunes

**"No se encontraron imágenes"**
→ Revisá que las fotos estén en la carpeta temporal correcta

**"Carpeta X no encontrada en la carpeta temporal"**
→ Para modelos, la subcarpeta en la carpeta temporal debe existir antes de procesar

**"No veo los menús"**
→ Tu cuenta tiene acceso de solo lectura a la hoja. Pedile a Lucas que te dé acceso de Editor.

**Error al hacer deploy / código 401**
→ El token de GitHub venció o no tiene el permiso `workflow`. Hay que generar uno nuevo y actualizarlo en las Propiedades del script.

---

¿Preguntas? Contactá a Lucas.
