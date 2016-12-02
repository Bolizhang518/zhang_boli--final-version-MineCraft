
// set dimensions of the canvas / graph  设置整个帆布位置和大小 
var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// set the ranges   设置主子的宽细  
var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height, 0]);

// define the axes  设定XY坐标轴的注释在 上下左右
var xAxis = d3.svg.axis()
        .scale(x)
          .orient("bottom");
var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

// add the svg canvas to the div with id = barchart  设置图表1的大小
var svg = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "barchart_svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// this div is used for the tooltip   工具提示 ？？没什么吊用 可删
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

// Load the data, process it, and display it with a bar chart.  重点部分，载入数据
// You can't load the fullsize file, so you'll need to do some
// preprocessing to break the data up or aggregate it
d3.csv("data/data.csv", function(error, data) {
  if (error) throw error;   //貌似废话一句

  // get the total time spent on each key
  var times = calc_time_per_key(data);    // 计算每个KEY 的次数

  // scale the data ranges
  // the x domain goes over the set of keys
  x.domain(data.map(function(d) { return d.key; }));  // X 的范围，serve id, user id, event. etc
  // y goes from 0 to the max value in times
  y.domain([0, d3.max(times, function(d) { return d.total_time; })]); // y 的范围, total_time
                                    //没有细分每个出现的次数     
  // add the axes -----append 是增加 ， 所以Var 是声明 
  svg.append("a")   //增加坐标轴 X   a 是所有X 上坐标轴标识 kicks, blockbreak,killedby , chat.etc 
      .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  svg.append("g")   //增加坐标轴Y  why ? both 'a'and'g' works in here ???
      .attr("class", "y axis")
    .call(yAxis)
  .append("text")     //  坐标轴的标识  Time(m) 
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Time (m)");

  // add the bars        加入 bar chart 重点！！！
  svg.selectAll(".bar")  //名字 是自定义的 ，需要改变颜色什么 可以统一call 
    .data(times)    // times 代表数据，因为统计的是次数，重复次数
    .enter().append("rect")   //声明一个rectangular 矩形 
      .attr("class", "bar")    // 为什么bar 就变颜色了？？
      .attr("x", function(d) { return x(d.key); })  // X 是 key 
      .attr("width", x.rangeBand())                 // x 是宽度
      .attr("y", function(d) { return y(d.total_time); }) //y 是 次数
      .attr("height", function(d) { return height - y(d.total_time); }) // Y 的高度
      .on("mouseover", function(d) {   // 鼠标点过去的设定 
        div.transition()    
          .duration(200)     //  鼠标停留多久显示 信息
          .style("opacity", .9); // 透明度 
        div.html(d.key + " = " + d.total_time)
          .style("left", (x(d.key) + x.rangeBand() + x.rangeBand()/2) + "px") // 跟随显示 在右边
                  .style("top", (d3.event.pageY - 28) + "px")  // 在上面 
        })
      .on("mouseout", function(d) {   // 鼠标离开后 
        div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 
        });
  console.log("done");   // d3.csv 读取完成 
});

// this gets the total time spent on each key 
// from on the loaded file and adds
// it to a javascript object called time_per_key.
function calc_time_per_key(data) {     // function 读取每个KEY 有多少。 
  var time_per_key = {};
  for(var i = 0; i < data.length; i+=1)
  {
    var row = data[i];
    if(row.key in time_per_key)
    {
      time_per_key[row.key] += row.stop_t - row.start_t;
    }
    else
    {
      time_per_key[row.key] = row.stop_t - row.start_t;
    }
  }
  
  //convert to array form   把CSV 中的KEY 转换成我可以在FUNCTION 里的call 的array 。
  var time_per_key_array = Object.keys(time_per_key).map(function (key) {
    return {
      "key": key, 
        "total_time": time_per_key[key]
    };
  });
  
  return time_per_key_array;
}