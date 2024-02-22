function bar_chart(id, data) {

    const margin = { top: 30, right: 30, bottom: 70, left: 60 }
    const width = 460 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3.select(`#${id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.right})`)

    const x = d3.scaleBand().range([0, width]).domain(Object.keys(data)).padding(0.2)
    const y = d3.scaleLinear().domain([0, d3.max(Object.values(data))]).range([height, 0])

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10.0) rotate(-45)")
        .style("text-anchor", "end")
    svg.append("g")
        .call(d3.axisLeft(y))
    
    svg.selectAll("bar")
        .data(Object.keys(data))
        .enter()
        .append("rect")
            .attr("x", day => x(day))
            .attr("y", day => y(data[day]))
            .attr("width", x.bandwidth())
            .attr("height", day => height - y(data[day]))
            .attr("fill", "#69b3a2")
            .attr("opacity", 1)
}

function line_plot(id, data) {

    // Set dimensions and margins for the chart
    const margin = { top: 70, right: 30, bottom: 40, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Set up the x and y scales
    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    // Set up the line generator
    const line = d3.line()
        .x(d => x(d.date_of_queries))
        .y(d => y(d.daily_users));

    // Create the SVG element and append it to the chart container
    const svg = d3.select(`#${id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // create tooltip div

    const tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");

    // Parse the date and convert the population to a number
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        d.date_of_queries = parseDate(d.date_of_queries);
    });

    // Set the domains for the x and y scales
    x.domain(d3.extent(data, d => d.date_of_queries));
    y.domain([0, d3.max(data, d => d.daily_users)]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-size", "14px")
        .call(d3.axisBottom(x)
            .tickValues(x.ticks(d3.timeDay.every(1))) // Display ticks every 6 months
            .tickFormat(d3.timeFormat("%b %d"))) // Format the tick labels to show Month and Year
        .call(g => g.select(".domain").remove()) // Remove the x-axis line
        .selectAll(".tick line") // Select all tick lines
        .style("stroke-opacity", 0)
    svg.selectAll(".tick text")
        .attr("fill", "#777");

    // Add vertical gridlines
    svg.selectAll("xGrid")
        .data(x.ticks().slice(1))
        .join("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", .5);

    // Add the y-axis
    svg.append("g")
        .style("font-size", "14px")
        .call(d3.axisLeft(y)
        .ticks((d3.max(data, d => d.daily_users)) / 10)
        // .tickFormat(d => {
        //     if (isNaN(d)) return "";
        //     return `${(d / 1000).toFixed(0)}k`;
        // })
        .tickSize(0)
        .tickPadding(10))
        .call(g => g.select(".domain").remove()) // Remove the y-axis line
        .selectAll(".tick text")
        .style("fill", "#777") // Make the font color grayer
        .style("visibility", (d, i, nodes) => {
            if (i === 0) {
                return "hidden"; // Hide the first and last tick labels
            } else {
                return "visible"; // Show the remaining tick labels
            }
        });

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#777")
        .style("font-family", "sans-serif")
        .text("Visits");

    // Add horizontal gridlines
    svg.selectAll("yGrid")
        .data(y.ticks((d3.max(data, d => d.daily_users)) / 10).slice(1))
        .join("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", .5)

    // Add the line path
    const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);

    // Add a circle element

    const circle = svg.append("circle")
        .attr("r", 0)
        .attr("fill", "steelblue")
        .style("stroke", "white")
        .attr("opacity", .70)
        .style("pointer-events", "none");
    // create a listening rectangle

    const listeningRect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .classed("listening-rect", true)

    // create the mouse move function

    listeningRect.on("mousemove", function (event) {
        const [xCoord] = d3.pointer(event, this);
        const bisectDate = d3.bisector(d => d.date_of_queries).left;
        const x0 = x.invert(xCoord);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - d0.date_of_queries > d1.date_of_queries - x0 ? d1 : d0;
        const xPos = x(d.date_of_queries);
        const yPos = y(d.daily_users);


        // Update the circle position

        circle.attr("cx", xPos)
        .attr("cy", yPos);

        // Add transition for the circle radius

        circle.transition()
        .duration(50)
        .attr("r", 5);

        // add in  our tooltip

        tooltip
        .style("display", "block")
        .style("left", `${xPos}px`)
        .style("top", `${yPos}px`)
        .html(`<strong>Date:</strong> ${d.date_of_queries.toLocaleDateString()}<br><strong>Daily Visits:</strong> ${d.daily_users}`)
    });
    // // listening rectangle mouse leave function

    listeningRect.on("mouseleave", function () {
        circle.transition()
        .duration(50)
        .attr("r", 0);

        tooltip.style("display", "none");
    });

    // Add the chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", margin.left + 60)
        .attr("y", margin.top - 100)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("Daily Visits");
}

const DUMMY_DEVICES = {
    Windows: 4,
    Linux: 1,
    Mac: 2,
    iOS: 5,
}

function pie_chart(id, data) {
    // Set the dimensions and margins of the graph
    const width = 350;
    const height = 350;
    const margin = 40;

    // Calculate the radius of the pie plot
    const radius = Math.min(width, height) / 2 - margin;

    // Append the SVG object to the div with the ID "devices-pie-chart"
    const svg = d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Define color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

    // Generate pie chart data
    const pie = d3.pie()
        .value(d => d[1]); // Use value from Object.entries()

    const pieData = pie(Object.entries(data));

    // Build pie slices
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Add slices to the pie chart
    svg.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0])) // Use color scale
        .attr("stroke", "white") // Add stroke for better visibility
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add text labels to the pie chart
    svg.selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .text(d => d.data[0]) // Display the device name
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "white");
}


const params = new URLSearchParams()
params.append('get_total_users', true)
params.append('get_total_queries', true)
params.append('get_daily_users', true)
params.append('get_device_counts', true)
params.append('get_browser_counts', true)
fetch('https://www.uwopenrecrosterbackend.xyz/analytics?' + params)
    .then(res => res.json())
    .then(analytics => {
        analytics.daily_users.sort((a, b) => new Date(a.date_of_queries) - new Date(b.date_of_queries))
        analytics.daily_users.forEach(d => d.date_of_queries = d.date_of_queries.substring(0, 10))
        
        analytics.device_counts = analytics.device_counts.reduce((acc, curr) => {
            acc[curr.device] = curr.total_device_queries
            return acc
        }, {})
        
        analytics.browser_counts = analytics.browser_counts.reduce((acc, curr) => {
            acc[curr.browser] = curr.total_browser_queries
            return acc
        }, {})
        

        console.log(analytics)

        line_plot('daily-visits-line-plot', analytics.daily_users)
        document.getElementById('total-users').textContent = analytics.total_users
        document.getElementById('total-visits').textContent = analytics.total_visits
        document.getElementById('total-schedules').textContent = analytics.total_queries
        pie_chart('devices-pie-chart', analytics.device_counts)
        pie_chart('browsers-pie-chart', analytics.browser_counts)
    })