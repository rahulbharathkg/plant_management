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
    
def fetch_hos_data(db_connection):
    try:
        hos_query = """
        SELECT COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC1%' THEN 1 END) AS HOS1,
 COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC2%' THEN 1 END) AS HOS2,
 COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC3%' THEN 1 END) AS HOS3,
 COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC4%' THEN 1 END) AS HOS4,
 COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC5%' THEN 1 END) AS HOS5,
 COUNT (CASE WHEN HOSPITAL LIKE '%Hospital PAC6%' THEN 1 END) AS HOS6,
 COUNT (HOSPITAL) AS HOSP
FROM CS_POUCH_TO_HOSPITAL_VIEW
        """

        hos_cursor = db_connection.cursor()
        hos_cursor.execute(hos_query)
        hos_data = hos_cursor.fetchall()

        print("hos data fetched successfully:", hos_data)  # Log successful data retrieval

        return hos_data

    except Exception as e:
        print("Error fetching HOS data:", e)  # Log any error that occurs during data retrieval
        print(traceback.format_exc())  # Print the traceback for detailed error information
        return None    

def fetch_station_data(db_connection, station_id):
    try:
        pss_query = f"""
            SELECT
                w.LOCATION AS STATION, w.STATUS, t.TRAYS_LIST
            FROM COR_WST_WORKSTATION w
            LEFT JOIN (
                SELECT 
                    v2.PS_NAME,LISTAGG(v2.TRAY_ACTIVATED, ', ') WITHIN GROUP (ORDER BY v2.TRAY_ACTIVATED) AS TRAYS_LIST
                FROM COR_WST_PACK_STAT_CONF_TRAY_V v2
                GROUP BY v2.PS_NAME
            ) t ON t.PS_NAME = w.LOCATION
            WHERE w.LOCATION LIKE '%{station_id}%'
            ORDER BY w.LOCATION
        """

        pss_cursor = db_connection.cursor()
        pss_cursor.execute(pss_query)
        pss_data = pss_cursor.fetchall()

        if pss_data:
            return pss_data
        else:
            return None
    except Exception as e:
        print("Error fetching station data:", e)
        return None
    