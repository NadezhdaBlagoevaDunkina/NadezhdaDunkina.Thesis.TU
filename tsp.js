module.exports = {

    getTspAlgorithm: function () {
        var algorithm = {};
        algorithm.setDestinations = function (destinations) {
            this.desiredDestinations = destinations;
        };

        algorithm.calculateOptimalRoute = function () {
            var stack = [];
            //matrica na susedstvo; toest razstoqnieto mejdu i-tata i j-tata destinaciq
            this.calculateAdjacencyMatrix();
            var orderedDestinations = [];
            var numberOfNodes = this.desiredDestinations.length; //v numberOfNodes ima broq na jelanite destinacii
            var visited = new Array(numberOfNodes + 1);
            // +1 -> za da ima mqsto za vsichki destinacii
            for (var index = 0; index < visited.length; index++) {
                visited[index] = 0; 
                //false; ne e posetena destinaciqta
            }
            visited[0] = 1;
            // true; posetena e destinaciqta, markira se nulevata destinaciq kato posetena
            stack.push(0); //pulni se v stack posetenata destinaciq
            var element;
            var dst = -1; //ne e indeks na destinaciq (dst), zatova e -1
            var i;
            var min = Number.MAX_SAFE_INTEGER;
            var minFlag = false; //minFlag e false, zashtoto oshte ne sme obhodili destinaciite
            orderedDestinations.push(this.desiredDestinations[0]);

            while (stack.length > 0) { //dokato stack ne e prazen
                element = stack[stack.length - 1]; // stack - LIFO - last in, first out
                // vzima se vyrha na steka (posledniq element)
                i = 0;
                min = Number.MAX_SAFE_INTEGER; //min e maksimalnoto chislo, koeto moje da ima
                while (i < numberOfNodes) {
                    // this e tekushtiqt obekt, na koito prinadleji funkciqta
                    // this e algorithm
                    if (this.adjacencyMatrix[element][i] > 0 && visited[i] == 0) {
                        //ako razstoqnieto ot element do i e > 0 i ako ne e posetena i-tata destinaciq (tekushtata)
                        if (min > this.adjacencyMatrix[element][i]) { //ako min e > ot razstoqnieto mejdu destinaciite; min ne e maks chislo veche, samo purviqt put e maksimalnoto chislo 
                            min = this.adjacencyMatrix[element][i]; // min = na razstoqnieto ot element do i
                            dst = i; //dst e tekushtata destinaciqta (i-tata)
                            //ako destinaciqta e posetena, to minavash prez drugite destinacii, a ako ne e posetena se vliza v if-ovete
                            minFlag = true;
                        }
                    }
                    i++; //preminavam kum sledvashtata destinaciq
                }
                if (minFlag) { // ako e namerilo nai-blizka destinaciq
                    visited[dst] = 1; //markirash nai-blizkata destinaciq kato posetena (ot 0 false i 1 true po-gore)
                    stack.push(dst); //pulni se stack s posetenite destinacii
                    // console.log(this.desiredDestinations[dst]);
                    orderedDestinations.push(this.desiredDestinations[dst]); // pulni se masiva s nai-blizkata destinaciq
                    minFlag = false; //resetva se minFlag
                    continue;
                }
                stack.pop(); // ako ne e namerilo nai-blizka destinaciq, q maha
            }
            return orderedDestinations; //vrushta jelanite destinacii
        };

        algorithm.calculateAdjacencyMatrix = function () {
            this.adjacencyMatrix = [];
            for (var i = 0; i < this.desiredDestinations.length; i++) { //for minava prez jelanite destinacii
                this.adjacencyMatrix.push([]); //v adjacencyMatrix se slaga prazen masiv
                //adjacencyMatrix shte bude masiv ot prazni masivi
            }
            for (var i = 0; i < this.desiredDestinations.length; i++) {
                for (var j = 0; j < this.desiredDestinations.length; j++) {
                    this.adjacencyMatrix[i][j] = this.calculateDistance(this.desiredDestinations[i], this.desiredDestinations[j]);
                    // adjacencyMatrix[2][5] = na razstoqnieto (izchisleno ot calculateDistance) ot 2-rata do 5-tata destinaciq; razstoqnieto e chislo
                    //the distance may be different because of one-way streets
                    this.adjacencyMatrix[j][i] = this.calculateDistance(this.desiredDestinations[j], this.desiredDestinations[i]);
                    // ot 5-tata do 2-rata
                }
            }
            //   console.log(this.adjacencyMatrix);
        };

        algorithm.calculateDistance = function (d1, d2) {
            if (d1 === d2) {
                return 0;
            }
            //TODO provide beter implementation
            return Math.sqrt(Math.pow(d1.latitude - d2.latitude, 2) + Math.pow(d1.longtitude - d2.longtitude, 2));
        };
        return algorithm;
    }
};