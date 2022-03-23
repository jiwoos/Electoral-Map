/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};


/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}




// coordinates of states for tile chart


coordinates = {
        AK: [0,0],
        ME: [0,11],

        VT: [1,10],
        NH: [1,11],

        WA: [2,1],
        ID: [2,2],
        MT: [2,3],
        ND: [2,4],
        MN: [2,5],
        IL: [2,6],
        WI: [2,7],
        MI: [2,8],
        NY: [2,9],
        RI: [2,10],
        MA: [2,11],

        OR: [3,1],
        NV: [3,2],
        WY: [3,3],
        SD: [3,4],
        IA : [3,5],
        IN: [3,6],
        OH: [3,7],
        PA: [3,8],
        NJ: [3,9],
        CT: [3,10],

        CA: [4,1],
        UT: [4,2],
        CO: [4,3],
        NE :[4,4],
        MO :[4,5],
        KY :[4,6],
        WV :[4,7],
        VA :[4,8],
        MD :[4,9],
        DC :[4,10],

        AZ :[5,2],
        NM :[5,3],
        KS :[5,4],
        AR :[5,5],
        TN :[5,6],
        NC :[5,7],
        SC :[5,8],
        DE :[5,9],
  
        OK :[6,4],
        LA :[6,5],
        MS :[6,6],
        AL :[6,7],
        GA :[6,8],
   
        HI :[7,1],
        TX :[7,4],
        FL :[7,9]
    };






/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;



    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile");

    var legendQuantile = d3.legendColor()
        .shapeWidth(100)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale);



    this.legendSvg.select(".legendQuantile").call(legendQuantile);




    

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



    Array.from(data).forEach((d) => {
        
        
        
          if (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage) {
              d.winningParty = "D";
              d.coordinates = coordinates[d.Abbreviation];
          }
          else if (d.I_Percentage > d.R_Percentage && d.I_Percentage > d.D_Percentage) {
              d.winningParty = "I";
              d.coordinates = coordinates[d.Abbreviation];
          }
          else if (d.R_Percentage > d.D_Percentage && d.R_Percentage > d.I_Percentage) {
              d.winningParty = "R";
              d.coordinates = coordinates[d.Abbreviation];
          }
        })

    console.log(data);





    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(data,function(d){
        return parseInt(d.coordinates[1]);
    });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(data,function(d){
            return parseInt(d.coordinates[0]);
    });

    const padding = 0;
    
    const xScale = d3
        .scaleLinear()
        .domain([0, self.maxColumns + 1])
        .range([0, self.svgWidth]);

    const yScale = d3
        .scaleLinear()
        .domain([0, self.maxRows + 1])
        .range([0, self.svgHeight]);





    // svg = d3.select('#tileChart').select()
    svg = d3.select("#tiles").select('svg');

    svg.selectAll('rect').remove();

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d) {
            return xScale(d.coordinates[1]);
        })
        .attr('y', function(d) {
            return yScale(d.coordinates[0]);
        })
        .attr('width', xScale(1))
        .attr('height', yScale(1))
        .attr('fill', function(d) {
             if (d.D_Percentage > d.R_Percentage && d.D_Percentage > d.I_Percentage) {
                return colorScale(Math.max(d.I_Percentage, d.R_Percentage) - d.D_Percentage);
            }
            if (d.R_Percentage > d.D_Percentage && d.R_Percentage > d.I_Percentage) {
                return colorScale(d.R_Percentage - Math.max(d.I_Percentage, d.D_Percentage));
            }
            else {
                return '#45AD6A';
            }
        });


    svg.selectAll('text').remove()

    svgText = svg.selectAll('text').data(data).enter();

    svgText
        .append('text')
        .attr("x", function(d) {
            return xScale(d.coordinates[1]) + xScale(0.5);
        })
        .attr("y", function(d) {
            return yScale(d.coordinates[0]) + xScale(0.6);
        })
        .attr("class", "tilestext")
        .text(function(d) {
            console.log("sjsjd");
            return d.Total_EV;
        });


    svgText
        .append('text')
        .attr("x", function(d) {
            return xScale(d.coordinates[1]) + xScale(0.5);
        })
        .attr("y", function(d) {
            return yScale(d.coordinates[0]) + xScale(0.3);
        })
        .attr("class", "tilestext")
        .text(function(d) {
            return d.Abbreviation;
        });

    





    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function(event, d) {
            return [0,0];
        })
        .html(function(event, d) {
             // populate data in the following format
             tooltip_data = {
             "state": d.State,
             "winner":d.winningParty,
             "electoralVotes" : d.Total_EV,
             "result":[
             {"nominee": d.D_Nominee,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
             {"nominee": d.R_Nominee,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
             {"nominee": d.I_Nominee,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
             ]
             }
             // * pass this as an argument to the tooltip_render function then,
             // return the HTML content returned from that method.
             
            return self.tooltip_render(tooltip_data);
        });



        self.svg.call(tip);

        self.svg    
        .selectAll('rect')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);











    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.

    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.

    //Display the state abbreviation and number of electoral votes on each of these rectangles

    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
















    
    });
    


    



};
