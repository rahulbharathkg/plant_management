import traceback

def fetch_pss_data(db_connection):
    try:
        pss_query = """
        SELECT *
        FROM CS_NOT_EMPTY_POUCHES_EACH_SECTION_V
        """

        pss_cursor = db_connection.cursor()
        pss_cursor.execute(pss_query)
        pss_data = pss_cursor.fetchall()

        print("PSS data fetched successfully:", pss_data)  # Log successful data retrieval

        return pss_data

    except Exception as e:
        print("Error fetching PSS data:", e)  # Log any error that occurs during data retrieval
        print(traceback.format_exc())  # Print the traceback for detailed error information
        return None



def fetch_presort_lane_data(db_connection):
    try:
        # Your SQL query for presort lane data retrieval
        presort_lane_query = """
        SELECT 
            'PSR ' || SUBSTR(SUBSTR(PK, -5), 1, 1) ||
            ' LANE ' || SUBSTR(SUBSTR(PK, -5), -1) AS PRESORT_LANES,
            NUM_OUTSTANDING_SKU_RQSTS AS TO_FILL,
            LOCK_STATUS,
            OPERATION_STATUS AS STATUS,
            TO_CHAR(STARTED_FILLING_TIME, 'DD-MON-YY HH.MI PM') AS FILL_TIME,
            TO_CHAR(BECAME_FULL_TIME, 'DD-MON-YY HH.MI PM')AS BECAME_FULL_TIME
        FROM 
            PSS_PRE_PRESORT_LANE
        """

        # Execute your query using the existing connection
        presort_lane_cursor = db_connection.cursor()
        presort_lane_cursor.execute(presort_lane_query)
        presort_lane_data = presort_lane_cursor.fetchall()

        print("Presort lane data fetched successfully:", presort_lane_data)  # Log successful data retrieval

        return presort_lane_data

    except Exception as e:
        print("Error fetching presort lane data:", e)
        return None