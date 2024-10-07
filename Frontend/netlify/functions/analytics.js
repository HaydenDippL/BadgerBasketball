import { query } from "../helpers/logging";

export async function handler(event, context) {
    const get_total_users = req.query.get_total_users || false;
    const get_total_visits = req.query.get_total_visits || false;
    const get_total_queries = req.query.get_total_queries || false;
    const get_users_over_time = req.query.get_users_over_time || false;
    const get_daily_users = req.query.get_daily_users || false;
    const get_days_activity_count = req.query.get_days_activity_count || false;
    const get_days_viewed_count = req.query.get_days_viewed_count || false;
    const get_future_views = req.query.get_future_views || false;
    const get_device_counts = req.query.get_device_counts || false;
    const get_browser_counts = req.query.get_browser_counts || false;

    const analytics = {};
    
    // lifetime users
    if (get_total_users) {
        const get_total_users_sql = `SELECT COUNT(DISTINCT IP) as total_users FROM sessions;`;
        analytics.total_users = (await query(get_total_users_sql, []))[0].total_users;
    }

    // lifetime site visits
    if (get_total_visits) {
        const get_total_visits_sql = `SELECT COUNT(*) as total_visits FROM sessions;`;
        analytics.total_visits = (await query(get_total_visits_sql, []))[0].total_visits;
    }

    // lifetime queries
    if (get_total_queries) {
        const get_total_queries_sql = `SELECT SUM(num_queries) as total_queries FROM sessions;`;
        analytics.total_queries = (await query(get_total_queries_sql, []))[0].total_queries;
    }

    // total users over time
    if (get_users_over_time) {
        // const get_users_over_time_sql = `SELECT date_of_queries, SUM(num_queries) OVER (ORDER BY date_of_queries) AS users_over_time FROM sessions;`
        const get_users_over_time_sql = `SELECT date_of_queries, COUNT(DISTINCT IP) AS num_users FROM sessions GROUP BY date_of_queries ORDER BY date_of_queries;`;
        analytics.users_over_time = JSON.parse(JSON.stringify(await query(get_users_over_time_sql, [])));
    }

    // daily users
    if (get_daily_users) {
        const get_daily_users_sql = `SELECT date_of_queries, COUNT(*) AS daily_users FROM sessions GROUP BY date_of_queries`;
        analytics.daily_users = JSON.parse(JSON.stringify(await query(get_daily_users_sql, [])));
    }

    // Get bar chart data for when we get queries each day of week
    if (get_days_activity_count) {
        const get_days_activity_count_sql = `SELECT DAYNAME(date_of_queries) AS day, SUM(num_queries) AS queries_on_day FROM sessions GROUP BY day`;
        analytics.get_days_activity_count = JSON.parse(JSON.stringify(await query(get_days_activity_count_sql, [])));
    }

    if (get_days_viewed_count) {
        const get_days_viewed_count_sql = `SELECT DAYNAME(date_queried) AS day, COUNT(*) AS queries_for_day FROM queries GROUP BY day`;
        analytics.get_days_viewed_count = JSON.parse(JSON.stringify(await query(get_days_viewed_count_sql, [])));
    }

    // Get bar chart data for how far in the future each user queries
    if (get_future_views) {
        const get_future_views_sql = `
            SELECT
                DATEDIFF(queries.date_queried, sessions.date_of_queries) AS days_difference,
                COUNT(*) AS count
            FROM queries
            JOIN sessions ON queries.session_id = sessions.session_id
            GROUP BY days_difference
            ORDER BY days_difference;
        `;
        analytics.future_views = JSON.parse(JSON.stringify(await query(get_future_views_sql, [])));
    }

    // Donut Diagram for devices
    if (get_device_counts) {
        const get_device_sql = `SELECT device, SUM(num_queries) AS total_device_queries FROM sessions GROUP BY device;`;
        analytics.device_counts = JSON.parse(JSON.stringify(await query(get_device_sql, [])));
    }

    // Donut Diagram for browsers
    if (get_browser_counts) {
        const get_browser_sql = `SELECT browser, SUM(num_queries) AS total_browser_queries FROM sessions GROUP BY browser;`;
        analytics.browser_counts = JSON.parse(JSON.stringify(await query(get_browser_sql, [])));
    }

    return {
        statusCode: 200,
        body: JSON.stringify(analytics)
    };
}