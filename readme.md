# [PIA](https://rodrigopivi.github.io/pia_es/) - Starter Kit de una asistente personal (chatbot) usando Chatito y RasaNLU

### [Online Demo](https://rodrigopivi.github.io/pia_es/)

Este proyecto sirve como ejemplo y "starter kit" para crear un agente personal (chatbot) usando Chatito como generador del dataset y Rasa NLU para entrenar los modelos usando Spacy.io y scikit-learn como backend.

Intenciones que Pia esta entrenada para entender:

```
saludos
despedida
wtf (manejar insultos y ruido)
cuenta chiste
prende o apaga luces
pon musica
titulares
marcadores deportivos
```

Las definiciones de las intenciones estan en la carpeta /example/intents

Se generan los datasets a partir de las definiciones en la gramatica chatito, se mezclaron aleatoriamente y dividieron en 50% los datasets para training y testing, en la carpeta /dataset el nombre del archivo de cada lista de ejemplos, tambien contiene
el numero de ejemplos que contiene.

## Estructura de archivos

- `./intents` -> definiciones en gramatica chatito para generar el dataset
- `./dataset` -> el dataset, training testing (archivos auto generados por chatito)
- `./rasa_project` -> modelo entrenado por rasa (archivos auto generados)

## Instalacion

Seguir las instrucciones de instalacion de Rasa NLU con backend de spacy. Luego instalar los modelos spacy en español (36.7MB y 98.5MB respectivamente):

```
python -m spacy download es
python -m spacy download es_core_news_md
pip install spacy scikit-learn scipy sklearn sklearn-crfsuite rasa-nlu 
```

## Paso adicional en windows
```
pip install pypiwin32
```

## Entrenar

```
python -m rasa_nlu.train -c config_spacy.json
```

O tambien se puede usar el npm script `npm run train`

### Iniciar servidor

```
python -m rasa_nlu.server -c config_spacy.json
```

O tambien se puede usar el npm script `npm run start`

Nota: para windows usar `npm run windows:server` para iniciar el servidor.

### Request de prueba
```
curl -XPOST localhost:5000/parse -d '{"q": "hey pia ponte el tema shining diamonds de pink floyd"
}' | python -mjson.tool
```

### Evaluacion

Podemos evaluar el modelo con el dataset de pruebas. Nota: La evaluacion solo evalua como maximo 100 ejemplos por intento.

Es necesario tener corriendo el servidor en puerto 5000:

```
python -m rasa_nlu.server -c config_spacy.json
```

En otra consola (para mantener el servidor corriendo), correr el comando:
```
npm run evaluate
```

Al final de la evaluacion, se muestra un reporte rapido y se guardan los resultados en `evaluation_results.json`.

### Acerca de este proyecto

Este es un "starter kit" no un bot de produccion, se agradece la amabilidad. La generacion de dialogo es con respuestas pre establecidas.

El objetivo de este proyecto se orienta a mostrar la automatizacion de la generacion de ejemplos de entrenamiento para el motor NLU responsable de extraer la intencion y argumentos de cada frase, si necesitas un motor de dialogo mas potente, puedes revisar rasa core.

La idea es mostrar como el modelo auto generador de ejemplos, define el modelo que procesa el lenguaje natural, simple.

## Autor

Rodrigo Pimentel
