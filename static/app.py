import cx_Oracle
import sys
from flask import Flask, render_template, redirect, url_for, session, request, jsonify
sys.path.append(r'C:\Users\rkrishni\OneDrive - ALTEN Group\python\tote-and-box-ocr')
from config import db_username, db_password, db_host, db_port, db_service_name
from flask import Flask, render_template, redirect, url_for, session, request
from functools import wraps
from loadunit_functions import perform_trace_check, perform_transport_request_check, perform_loadunit_check
from pss_monitor import fetch_pss_data, fetch_presort_lane_data
import traceback

app = Flask(__name__, template_folder='templates')
app.secret_key = 'your_secret_key'

# A dictionary to simulate user authentication (replace this with your user database)
valid_users = {
    '123': '123'
}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in valid_users and valid_users[username] == password:
            session['username'] = username
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/home')
@login_required
def home():
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('home'))

# Initialize Oracle Client
cx_Oracle.init_oracle_client(lib_dir=r'C:\Users\rkrishni\OneDrive - ALTEN Group\python\tote-and-box-ocr\instantclient-basic-windows.x64-21.12.0.0.0dbru\instantclient_21_12')

# Define the connection details using imported credentials
db_dsn = cx_Oracle.makedsn(db_host, db_port, service_name=db_service_name)

# Establish a connection
db_connection = cx_Oracle.connect(db_username, db_password, db_dsn)

# Route to execute the ORDER DETAILS and STATUS queries
@app.route('/execute-queries', methods=['POST'])
def execute_queries():
    try:
        # Create a cursor for the ORDER DETAILS query
        db_cursor_order_details = db_connection.cursor()
        db_cursor_status = db_connection.cursor()

        # Get the input value for both queries from the POST request
        order_id = request.form.get('order_id')

        # Execute the SQL query for ORDER DETAILS
        sql_query_order_details = """
        
        SELECT
            REGEXP_SUBSTR(ORDER_PK, 'KER##(.*)', 1, 1, NULL, 1) AS ORDER_ID,
            ORDER_LINE_ID,
            SKU_PK AS SKU,
            COMPANY,
            COUNTRY_OF_ORIGIN AS COUNTRY,
            QUALITY,
            QTY_BASE_TARGET AS QUANTITY,
            RVL.REQUIRED_VASLINES AS REQUIRED_VAS,
            LOAD_UNIT_ID AS Loadunit
        FROM 
            ORP_ORG_ORDER_LINE_DIAL_V OIC
        LEFT JOIN 
            ORP_ORG_INVCRIT_R_VAS_L RVL ON OIC.PK = RVL.ORP_ORG_INVENTORY_CRITERIA
        WHERE
            OIC.CREATE_DATE >= TRUNC(SYSDATE) - 5
            AND REGEXP_LIKE(REGEXP_SUBSTR(ORDER_PK, 'KER##(.*)', 1, 1, NULL, 1), '^2')    
        AND REGEXP_SUBSTR(ORDER_PK, 'KER##(.*)', 1, 1, NULL, 1) = :order_id   
         """
        db_cursor_order_details.execute(sql_query_order_details, order_id=order_id)

        # Execute the SQL query for STATUS
        sql_query_status = """
        SELECT A.STATUS,
               TO_CHAR(A.CREATE_DATE, 'DD-MON-YY HH.MI PM') AS F_CREATE_DATE,
               TO_CHAR(A.MOD_DATE, 'DD-MON-YY HH.MI PM') AS F_MOD_DATE,
               TO_CHAR(A.PACK_TIME_TARGET, 'DD-MON-YY HH.MI PM') AS TARGET_DATE,
               B.SORTATION_ORDER_ID
        FROM ORP_ORG_ORDER A
        LEFT JOIN ORP_SOM_ORDER B ON A.PK = B.ORDER_PK
        WHERE  A.CREATE_DATE >= SYSDATE - 5
            AND REGEXP_LIKE(A.ORDER_ID, '^2')
            AND A.STATUS NOT IN ('TO_CONFIRM', 'COMPLETE')
            AND A.ORDER_ID = :order_id
        """
        db_cursor_status.execute(sql_query_status, order_id=order_id)

        # Fetch and return the results for both queries
        result_order_details = db_cursor_order_details.fetchall()
        result_status = db_cursor_status.fetchall()

        if result_order_details or result_status:
            # Create dictionaries to hold the query results
            result_dict = {"ORDER_DETAILS": [], "STATUS": []}

            from collections import defaultdict

            if result_order_details:
                order_details_dict = defaultdict(list)

                for row_order_details in result_order_details:
                    order_id_order_details, order_line_id_order_details, sku_order_details, company_order_details, country_order_details, quality_order_details, quantity_order_details, required_vas_order_details, load_unit_id = row_order_details
        
                    order_details_dict[order_line_id_order_details].append({
            "ORDER_LINE_ID": order_line_id_order_details,
            "SKU": sku_order_details,
            "COMPANY": company_order_details,
            "COUNTRY": country_order_details,
            "QUALITY": quality_order_details,
            "QUANTITY": quantity_order_details,
            "REQUIRED_VAS": required_vas_order_details,
            "Loadunit": load_unit_id
            
                     })

                consolidated_order_details = []

                for order_line_id, details_list in order_details_dict.items():
                    if len(details_list) > 1:
            # Combine REQUIRED_VAS if multiple rows exist for the same ORDER_LINE_ID
                        required_vas_combined = ','.join(detail['REQUIRED_VAS'] for detail in details_list)
                        details_list[0]['REQUIRED_VAS'] = required_vas_combined
                        consolidated_order_details.append(details_list[0])
                    else:
                        consolidated_order_details.extend(details_list)

                result_dict["ORDER_DETAILS"] = consolidated_order_details
           
            if result_status:
                for row_status in result_status:
                    status_status, create_date_status, mod_date_status, pack_date_status, sortation_order_id_status = row_status
                    result_dict["STATUS"].append({
                        "STATUS": status_status,
                        "F_CREATE_DATE": create_date_status,
                        "F_MOD_DATE": mod_date_status,
                        "F_PACK_TARGET": pack_date_status,
                        "SORTATION_ORDER_ID": sortation_order_id_status
                    })
            return jsonify(result_dict)

        return jsonify({"error": "No data found for the provided ORDER_ID in both queries"})

    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({"error": "Oracle Database Error: " + error.message})

    finally:
        # Close the cursors for both queries
        db_cursor_order_details.close()
        db_cursor_status.close()

@app.route('/fetch-sku-results', methods=['POST'])
def fetch_sku_results():
    try:
        sku = request.form.get('sku')

        sql_query_inv = """
        SELECT
            x.SKU,
            x.COUNTRY_OF_ORIGIN AS CN,
            x.QUALITY AS QL,
            x.COMPANY AS CP,
            x.QUANTITY AS QTY,
            x.QUANTITY_FREE AS QTY_FREE,
            l.AVAILABILITY_STATUS,
            l.LOC,
            CASE WHEN c.POUCHABLE = 1 THEN 'YES'
                 WHEN c.POUCHABLE = 0 THEN 'NO'
                 ELSE 'NULL'
            END AS POUCHABLE
        FROM
            WCR_INV_UNIT x
        JOIN WCR_INV_UNIT_LOCATION_V l ON x.PK = l.PK
        LEFT JOIN
            COR_SKU_SKU_QTY_UNIT_DIAL_V c ON x.SKU = c.SKU
        WHERE x.SKU = :sku
        """

        sql_query_sortation = query = """
    SELECT
        a.ID AS SLU_ID,
        a.PLANNED_ORDER_ID AS S_ORDER_ID,
        LISTAGG(b.VAS_TYPE, ', ') WITHIN GROUP (ORDER BY b.VAS_TYPE) AS VAS_TYPE,
        a.LOCATION,
        a.ARRIVED_AT_LOCATION_DATE AS ARR_TIME,
        SUBSTR(a.SORTATION_QUANTITY_UNIT, 1, 14) AS SKU,
        a.ERROR_CODE AS ERR,
        COMPANY AS CP,
        QUALITY AS QL,
        COUNTRY_OF_ORIGIN AS CN
    FROM
        PSS_COR_SORT_LOAD_UNIT a
    LEFT JOIN
        PSS_COR_SLU_REQ_VAS_TYPE b ON b.SORTATION_LOAD_UNIT = a.ID
    JOIN
        COR_SKU_SKU_QTY_UNIT_DIAL_V c ON a.SORTATION_QUANTITY_UNIT = c.pk
    WHERE a.SORTATION_QUANTITY_UNIT LIKE :sku
    GROUP BY
        a.ID,
        a.PLANNED_ORDER_ID,
        a.LOCATION,
        a.ARRIVED_AT_LOCATION_DATE,
        SUBSTR(a.SORTATION_QUANTITY_UNIT, 1, 14),
        a.ERROR_CODE,
        COMPANY,
        QUALITY,
        COUNTRY_OF_ORIGIN
"""


        cursor = db_connection.cursor()
        result_inv = cursor.execute(sql_query_inv, sku=sku).fetchall()
        result_sortation = cursor.execute(sql_query_sortation, sku='%' + sku + '%').fetchall()
        cursor.close()

        result_dict = {"INV_RESULTS": result_inv, "SORTATION_RESULTS": result_sortation}

        return jsonify(result_dict)

    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({"error": "Oracle Database Error: " + error.message})

# Route to execute the new query for analysis
@app.route('/analyse-data', methods=['POST'])
def analyse_data():
    try:
        sortation_order_id = request.form.get('sortation_order_id')
        db_cursor_analysis = db_connection.cursor()

        sql_query_analysis = """
        SELECT
            SORT_ORDER,
            REQ_VAS,
            SKU,
            REQ_QTY, 
            POUCH_QUANTITY AS AVL_POUCH,
            QUALITY AS QL, 
            COMPANY AS CP, 
            COUNTRY AS CT
        FROM
            CS_VAS_MISSMATCH_V
        WHERE SORT_ORDER = :sortation_order_id
        """

        db_cursor_analysis.execute(sql_query_analysis, sortation_order_id=sortation_order_id)

        result_analysis = db_cursor_analysis.fetchall()

        if result_analysis:
            result_dict = {"ANALYSIS_RESULTS": []}
            for row_analysis in result_analysis:
                sort_order, req_vas, sku, req_qty, avl_pouch, ql, cp, ct = row_analysis
                result_dict["ANALYSIS_RESULTS"].append({
                    "SORT_ORDER": sort_order,
                    "REQ_VAS": req_vas,
                    "SKU": sku,
                    "REQ_QTY": req_qty,
                    "AVL_POUCH": avl_pouch,
                    "QL": ql,
                    "CP": cp,
                    "CT": ct
                })
            return jsonify(result_dict)

        return jsonify({"error": "No analysis results found for the provided SORTATION_ORDER_ID."})

    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({"error": "Oracle Database Error: " + error.message})

    finally:
        db_cursor_analysis.close()
        
@app.route('/fetch-extra-data', methods=['GET'])
def fetch_extra_data():
    try:
        cursor = db_connection.cursor()

        sql_query_sten = """
        SELECT 'KER#' || SKU AS SKU,
               STEN,
               N_POUCH,
               QUALITY,
               COUNTRY,
               COMPANY
        FROM CS_FAKE_STEN_V
        """
        cursor.execute(sql_query_sten)
        result_sten = cursor.fetchall()

        sql_query_stba = """
        SELECT 'KER#' || SKU AS SKU,
               STBA,
               N_POUCH,
               QUALITY,
               COUNTRY,
               COMPANY
        FROM CS_FAKE_STBA_V
        """
        cursor.execute(sql_query_stba)
        result_stba = cursor.fetchall()

        cursor.close()

        return jsonify({"CS_FAKE_STEN_V": result_sten, "CS_FAKE_STBA_V": result_stba})

    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({"error": "Oracle Database Error: " + error.message})

from flask import jsonify

from flask import jsonify

@app.route('/check-alarm', methods=['POST'])
def check_alarm():
    try:
        data = request.get_json()
        order_id = data.get('alarm_order_id')
        db_cursor_alarm = db_connection.cursor()

        sql_query_alarm = """
            SELECT * FROM (
                SELECT PARAMETER_VALUE AS DETAILS, TO_CHAR(CREATE_DATE, 'DD-MON-YY HH.MI PM') AS CREATE_DATE
                FROM APP_ALM_ALARMMONITOR_V
                WHERE TRUNC(CREATE_DATE) = TRUNC(SYSDATE)
                    AND PARAMETER_VALUE LIKE :order_id
                ORDER BY CREATE_DATE DESC
            )
            WHERE ROWNUM <= 5
        """
        db_cursor_alarm.execute(sql_query_alarm, order_id=('%' + order_id + '%'))

        result_alarm = db_cursor_alarm.fetchall()

        if result_alarm:
            result_dict = {"ALARM": []}
            for row_alarm in result_alarm:
                details_alarm, create_date_alarm = row_alarm
                result_dict["ALARM"].append({"DETAILS": details_alarm, "CREATE_DATE": create_date_alarm})

            return jsonify(result_dict)

        return jsonify({"error": "No matching ALARM details found for the provided ORDER_ID."})

    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({"error": "Oracle Database Error: " + str(error)})

    finally:
        db_cursor_alarm.close()
        
@app.route('/perform_trace_check', methods=['POST'])
def perform_trace():
    try:
        loadunit_id = request.json['loadunit_id']
        print('Received loadunit ID:', loadunit_id)  # Log the received loadunit ID

        result = perform_trace_check(loadunit_id, db_connection)
        print("Result from perform_trace_check:", result)  # Log the result from the function

        return jsonify(result)
    except Exception as e:
        print("Exception occurred:", e)  # Log if there's an exception
        return jsonify({"error": f"Error: {str(e)}"})
    
    
@app.route('/perform_transport_request_check', methods=['POST'])
def perform_transport_request():
    try:
        loadunit_id = request.json['loadunit_id']
        print('Received loadunit ID:', loadunit_id)  # Log the received loadunit ID

        result = perform_transport_request_check(loadunit_id, db_connection)
        print("Result from perform_transport_request_check:", result)  # Log the result from the function

        return jsonify(result)
    except Exception as e:
        print("Exception occurred:", e)  # Log if there's an exception
        return jsonify({"error": f"Error: {str(e)}"})
    
@app.route('/perform_loadunit_check', methods=['POST'])
def perform_loadunit_checking():
    try:
        loadunit_id = request.json['loadunit_id']
        print('Received loadunit ID:', loadunit_id)  # Log the received loadunit ID

        result = perform_loadunit_check(loadunit_id, db_connection)  # Replace with your query function
        print("Result from perform_loadunit_check_query:", result)  # Log the result from the function

        return jsonify(result)
    except Exception as e:
        print("Exception occurred:", e)  # Log if there's an exception
        return jsonify({"error": f"Error: {str(e)}"})

@app.route('/fetch_pss_data', methods=['GET'])
def get_pss_data():
    try:
        pss_data = fetch_pss_data(db_connection)
        if pss_data is not None:
            app.logger.info("PSS data fetched successfully")
            print("PSS data fetched successfully:", pss_data)  # Log successful data retrieval
            return jsonify(pss_data)
        else:
            app.logger.error("Failed to fetch PSS data")
            return jsonify({"error": "Failed to fetch PSS data"})
    except Exception as e:
        app.logger.error(f"Error fetching PSS data: {traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch PSS data"})

@app.route('/fetch_presort_lane_data', methods=['GET'])
def get_presort_lane_data():
    try:
        presort_lane_data = fetch_presort_lane_data(db_connection)
        if presort_lane_data is not None:
            app.logger.info("Presort lane data fetched successfully")
            print("Presort lane data fetched successfully:", presort_lane_data)  # Log successful data retrieval
            return jsonify(presort_lane_data)
        else:
            app.logger.error("Failed to fetch presort lane data")
            return jsonify([{"error": "Failed to fetch presort lane data"}])
    except Exception as e:
        app.logger.error(f"Error fetching presort lane data: {traceback.format_exc()}")
        return jsonify([{"error": "Failed to fetch presort lane data"}])
        
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080,debug=True)