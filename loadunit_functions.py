def perform_trace_check(loadunit_id, db_connection):
    try:
        # Define SQL query
        trace_query = """
        SELECT TO_CHAR(CDATE, 'DD-MON-YY HH.MI PM') AS MOD_DATE, OPERATION_ID, USER_DATA
        FROM APP_MM_TRACE
        WHERE CDATE >= SYSDATE - 2 AND USER_DATA LIKE :loadunit_id
        ORDER BY CDATE DESC
        """

        # Fetch the data from the database without sorting
        trace_cursor = db_connection.cursor()
        trace_cursor.execute(trace_query, {'loadunit_id': '%' + loadunit_id + '%'})
        trace_rows = trace_cursor.fetchall()
        trace_cursor.close()

        # Return the fetched rows as JSON
        return trace_rows

    except Exception as e:
        return {"error": f"Error: {str(e)}"}



def perform_transport_request_check(loadunit_id, db_connection):
    try:
        # Define SQL query for Transport Request table
        transport_query = """
        SELECT  LU_ID,
                STATUS,
                ERROR_REASON,
                SOURCE_LOC,
                PROCESS_STATUS,
                GLOBAL_LOC,
                TO_CHAR(TO_CREATE_DATE, 'DD-MON-YY HH.MI PM') AS CREATE_DATE,
                TO_CHAR(TO_MOD_DATE, 'DD-MON-YY HH.MI PM') AS MOD_DATE,
                TO_MOD_USER
        FROM 
                MFC_COR_TRANSPORT_ORDER_V
            WHERE LOAD_UNIT_PK LIKE :loadunit_id
        """

        transport_cursor = db_connection.cursor()
        transport_cursor.execute(transport_query, loadunit_id=('%' + loadunit_id + '%'))
        transport_results = transport_cursor.fetchall()
        transport_cursor.close()

        # Return results for both tables
        return {"Transport_Results": transport_results}

    except Exception as e:
        return {"error": f"Error: {str(e)}"}

def perform_loadunit_check(loadunit_id, db_connection):
    try:
        # Define SQL query
        loadunit_query = """
        SELECT PK AS LOADUNIT_ID,
            TO_CHAR(LOCATION_ARRIVAL_DATE, 'DD-MON-YY HH.MI PM') AS LOC_ARR_DATE,
            CURRENT_LOC,
            STATUS,
            STATUS_REASON,
            ERROR_CODE,
            ERROR_REASON,
            LOCK_STATUS,
            CLIENT,
            MOD_USER,
            TO_CHAR(CREATE_DATE, 'DD-MON-YY HH.MI PM') AS CREATE_DATE
        FROM COR_LUM_LOAD_UNIT
        WHERE PK LIKE :loadunit_id
        """

        loadunit_cursor = db_connection.cursor()
        loadunit_cursor.execute(loadunit_query, loadunit_id=('%' + loadunit_id + '%'))
        loadunit_results = loadunit_cursor.fetchall()
        loadunit_cursor.close()
        
        # Return the list of dictionaries
        return {"Loadunit_Results": loadunit_results}

    except Exception as e:
        return {"error": f"Error: {str(e)}"}
    
 
    