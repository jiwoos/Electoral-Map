
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    // ******* TODO: PART II *******
    console.log("==Electoral Vote==")
    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    d3.csv(electionResult).then(function(data) {
        Array.from(data).forEach((d) => {
          d.D_Percentage = +d.D_Percentage;
          d.R_Percentage = +d.R_Percentage;
          d.I_Percentage = +d.I_Percentage;
          d.D_Votes = +d.D_Votes;
          d.R_Votes = +d.R_Votes;
          d.I_Votes = +d.I_Votes;
          d.Total_EV = +d.Total_EV;
          d.Year = +d.Year;
        })


        var groupD = [];
        var groupR = [];
        var groupI = [];
        var dataset = [];

        var groupD_totalEV = 0;
        var groupR_totalEV = 0;
        var groupI_totalEV = 0;




        //group them
        Array.from(data).forEach((d) => {
          if (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage) {
              sorted = Math.max(d.I_Percentage, d.R_Percentage) - d.D_Percentage;
              groupD.push(["democrat", d.State, d.Total_EV, d.D_Percentage, d.I_Percentage, d.R_Percentage, sorted]);

              groupD_totalEV = groupD_totalEV + d.Total_EV;
          }
          else if (d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage) {
              
              groupI.push(["independent", d.State, d.Total_EV, d.D_Percentage, d.I_Percentage, d.R_Percentage]);
              groupI_totalEV = groupI_totalEV + d.Total_EV;
             
          }
          else if (d.R_Percentage > d.D_Percentage && d.R_Percentage > d.I_Percentage) {
              sorted = Math.max(d.I_Percentage, d.D_Percentage) - d.R_Percentage;
              groupR.push(["republican", d.State, d.Total_EV, d.D_Percentage, d.I_Percentage, d.R_Percentage, sorted]);   
              groupR_totalEV = groupR_totalEV + d.Total_EV;
          }
        })

        groupD.sort(function(a,b) {
            return a[6] - b[6];
        })

        groupR.sort(function(a,b) {
          return b[6] - a[6];
        })

        groupI.sort(function(a,b) {
          return a[4] - b[4];
        })

        dataset = groupI.concat(groupD, groupR);

        dataset_totalEV = groupD_totalEV + groupI_totalEV + groupR_totalEV;
        
        // Scale
        var x = d3.scaleLinear()
        .domain([0, dataset_totalEV])
        .range([0, self.svgWidth]);

        //Create the stacked bar chart.
        //Use the global color scale to color code the rectangles.
        //HINT: Use .electoralVotes class to style your bars.
        var svg = d3.select('#electoral-vote')
  						.selectAll('svg');



        svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        svg.selectAll('line').remove();


        var track = 0;

        
        svg.append('text')
        .attr('x', x(253))
        .attr('y', 65) 
        // .style('font-size', 9)
        .text("Vote to win: 270")
        .transition()
        .duration(1000);

    
        if (groupI_totalEV > 0) {

            svg.append('text')
            // .transition()
            // .duration(1000)
                .attr('x', x(0))
                .attr('y', 20) 
                // .style('font-size', 9)
                .attr('class', 'independent')
                .text(groupI_totalEV);
        }

        svg.append('text')
            // .transition()
            // .duration(1000)
            .attr('x', x(groupI_totalEV))
            .attr('y', 20) 
            // .style('font-size', 9)
            .attr('class', 'democrat')
            .text(groupD_totalEV);

        svg.append('text')
            // .transition()
            // .duration(1000)
            .attr('x', x(groupI_totalEV + groupD_totalEV + 20))
            .attr('y', function() {
                return 20; }) 
            // .style('font-size', 9)
            .attr('class', 'republican')
            .text(groupR_totalEV);


        dataset.forEach(function(element) {
                svg
                .append("rect")
                .attr("class", "electoralVotes democrat")
                .attr("id", element)
                .attr("y", 30)
                .attr("height", 20)
                .transition()
                .duration(1000)
                .attr("x", function() {
                    ret_val = track;
                    track = track + x(element[2]);
                  return ret_val;
                })
                .attr("width", x(element[2]))
                .style('fill', function() {
                    if (element[0] == 'democrat') {
                        return colorScale((Math.max(element[4], element[5]) - element[3]));
                    }
                    else if (element[0] == 'republican') {
                        return colorScale((element[5]) - (Math.max(element[4], element[3])));
                    }
                    else {
                        return 'green';
                    }
                });

        })
           
         


        svg.selectAll('rect').exit().remove();
   
         svg.append('line')
         .transition()
         .duration(1000)
            .attr('x1', x(270))
            .attr('x2', x(270))
            .attr('y1', 28)
            .attr('y2', 52)
            .attr('stroke', 'black');
            

    });



    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
