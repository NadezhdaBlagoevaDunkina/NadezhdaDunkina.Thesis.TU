module.exports = {

    getTspAlgorithm: function () {
        var algorithm = {};
        algorithm.setDestinations = function (destinations) {
            this.desiredDestinations = destinations;
        };

        algorithm.calculateOptimalRoute = function () {
            var stack = [];
            this.calculateAdjacencyMatrix();
            var orderedDestinations = [];
            var numberOfNodes = this.desiredDestinations.length;
            var visited = new Array(numberOfNodes + 1);
            for (var index = 0; index < visited.length; index++) {
                visited[index] = 0;
            }
            visited[0] = 1;
            stack.push(0);
            var element;
            var dst = -1;
            var i;
            var min = Number.MAX_SAFE_INTEGER;
            var minFlag = false;
            orderedDestinations.push(this.desiredDestinations[0]);

            while (stack.length > 0) {
                element = stack[stack.length - 1];
                i = 0;
                min = Number.MAX_SAFE_INTEGER;
                while (i < numberOfNodes) {
                    if (this.adjacencyMatrix[element][i] > 0 && visited[i] == 0) {
                        if (min > this.adjacencyMatrix[element][i]) {
                            min = this.adjacencyMatrix[element][i];
                            dst = i;
                            minFlag = true;
                        }
                    }
                    i++;
                }
                if (minFlag) {
                    visited[dst] = 1;
                    stack.push(dst);
                    console.log(this.desiredDestinations[dst]);
                    orderedDestinations.push(this.desiredDestinations[dst]);
                    minFlag = false;
                    continue;
                }
                stack.pop();
            }

            return orderedDestinations;
        };

        algorithm.calculateAdjacencyMatrix = function () {
            this.adjacencyMatrix = [];
            for (var i = 0; i < this.desiredDestinations.length; i++) {
                this.adjacencyMatrix.push([]);

            }
            for (var i = 0; i < this.desiredDestinations.length; i++) {
                for (var j = 0; j < this.desiredDestinations.length; j++) {
                    this.adjacencyMatrix[i][j] = this.calculateDistance(this.desiredDestinations[i], this.desiredDestinations[j]);
                    //the distance may be different because of one-way streets
                    this.adjacencyMatrix[j][i] = this.calculateDistance(this.desiredDestinations[j], this.desiredDestinations[i]);
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