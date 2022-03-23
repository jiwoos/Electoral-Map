/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
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
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;

    

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
        var data_for_graph = [];

        var groupD_totalVotes = 0;
        var groupR_totalVotes = 0;
        var groupI_totalVotes = 0;


    Array.from(data).forEach((d) => {
          if (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage) {
              groupD.push(d);
              groupD_totalVotes = groupD_totalVotes + d.D_Votes;
          }
          else if (d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage) {
              groupI.push(d);
              groupI_totalVotes = groupI_totalVotes + d.I_Votes;
          }
          else if (d.R_Percentage > d.D_Percentage && d.R_Percentage > d.I_Percentage) {
              groupR.push(d);   
              groupR_totalVotes = groupR_totalVotes + d.R_Votes;
          }
        })



    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, self.svgWidth]);
        
    var svg = d3.select('#votes-percentage')
                        .selectAll('svg');

    svg.selectAll('rect').remove();
        svg.selectAll('text').remove();
        svg.selectAll('line').remove();

    dataset = groupI.concat(groupD, groupR);
    dataset_totalVotes = groupD_totalVotes + groupI_totalVotes + groupR_totalVotes;

    dPercent = d3.format(".2s")(groupD_totalVotes/dataset_totalVotes * 100);
    rPercent = d3.format(".2s")(groupR_totalVotes/dataset_totalVotes * 100);
    iPercent = d3.format(".2s")(groupI_totalVotes/dataset_totalVotes * 100);


    data_for_graph.push(iPercent);
    data_for_graph.push(dPercent);
    data_for_graph.push(rPercent);

    dNominee = dataset[0].D_Nominee;
    rNominee = dataset[0].R_Nominee;
    iNominee = dataset[0].I_Nominee;

    track = 0;


    svg.append('text')
        .attr('x', 0)
        .attr('y', 20) 
        .attr('class', 'independent')
        .text(iNominee);

    svg.append('text')
        .attr('x', function() {
            if (iPercent > 0 || iNominee != "") {
                return self.svgWidth/3 ;
            }
            return self.svgWidth/4 -self.svgWidth/6;
        })
        .attr('y', 20) 
        .attr('class', 'democrat')
        .text(dNominee);

    svg.append('text')
        .attr('x', self.svgWidth - self.svgWidth/4)
        .attr('y', 20) 
        // .style('font-size', 7)
        .attr('class', 'republican')
        .text(rNominee);





     svg.append('text')
        .attr('x', self.svgWidth/2 - 40)
        .attr('y', 95) 
        .text("Popular Votes(50%)");


        if (iPercent > 0) {
            svg.append('text')
                .attr('y', 40) 
                .attr('x', x(0))
                .attr('class', 'independent')
                .text(iPercent);
        }
            


        svg.append('text')
            .attr('x', x(iPercent))
            .attr('y', 40) 
            .attr('class', 'democrat')
            .text(dPercent);

        svg.append('text')
            // .transition()
            // .duration(1000)
            .attr('x', x(dPercent) + x(iPercent) + x(2))
            .attr('y', 40)
            // .style('font-size', 7)
            .attr('class', 'republican')
            .text(rPercent);


    var colorTrack = 0;
    data_for_graph.forEach(function(element) {
                svg
                .append("rect")
                .attr("class", "votePercentage")
                .attr("y", 50)
                .attr("height", 30)
                .transition()
                .duration(1000)
                .attr("x", function() {
                    ret_val = track;
                    track = track + x(element);
                  return ret_val;
                })
                .attr("width", x(element))
                .attr("class", function() {
                    ret2_val = colorTrack;
                    colorTrack++;
                    if (ret2_val ==0) {
                        return "independent"
                    }
                    else if (ret2_val == 1) {
                        return 'democrat';
                    }
                    else {
                        return 'republican';
                    }
                });







        svg.append('line')
        .transition()
        .duration(1000)
            .attr('x1', self.svgWidth/2)
            .attr('x2', self.svgWidth/2)
            .attr('y1', 48)
            .attr('y2', 83)
            .attr('stroke', 'black');
        });



    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
             // populate data in the following format
             tooltip_data = {
             "result":[
             {"nominee": dNominee,"votecount": groupD_totalVotes,"percentage": dPercent,"party":"D"} ,
             {"nominee": rNominee,"votecount": groupR_totalVotes,"percentage": rPercent,"party":"R"} ,
             {"nominee": iNominee,"votecount": groupI_totalVotes,"percentage": iPercent,"party":"I"}
             ]
             }
             // * pass this as an argument to the tooltip_render function then,
             // * return the HTML content returned from that method.
             // * 
            return self.tooltip_render(tooltip_data);
        });






        self.svg.call(tip);

        self.svg    
        .selectAll('rect')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);






    });
    
};
