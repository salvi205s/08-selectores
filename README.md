# Selectores

switchMap
Este operador permite transformar los valores emitidos por un observable en otro observable, y cancelar las suscripciones anteriores si se emite un nuevo valor. En este caso, el código recibe un código alfa de un país (como ‘ES’ o ‘FR’) y llama a un servicio que devuelve un observable con la información del país. El operador switchMap se asegura de que solo se reciba la información del último país solicitado, y se ignoren los anteriores.
