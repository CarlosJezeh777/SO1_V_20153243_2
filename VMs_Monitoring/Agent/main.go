package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "os/exec"
    "time"

    "github.com/gorilla/handlers"
    "github.com/gorilla/mux"
    "github.com/shirou/gopsutil/cpu"
)

type Process struct {
	Pid    int     `json:"pid"`
	Name   string  `json:"name"`
	User   int     `json:"user"`
	State  int     `json:"state"`
	Ram    float64 `json:"ram"`
	Father int     `json:"father"`
}

type Cpu struct {
	Usage     float64   `json:"percentage_used"`
	Processes []Process `json:"tasks"`
}

type Ram struct {
	Total float64 `json:"total_ram"`
	Free  float64 `json:"free_ram"`
	Used  float64 `json:"used_ram"`
	Perc  float64 `json:"percentage_used"`
}

type Ip struct {
	Ip string `json: "ip"`
}

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Welcome!!")
}

/* func sendDataToAPI(apiURL string, endpoint string, data interface{}) error {
    jsonData, err := json.Marshal(data)
    if err != nil {
        return fmt.Errorf("error al convertir a JSON: %v", err)
    }

    resp, err := http.Post(apiURL+endpoint, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        return fmt.Errorf("error al enviar datos: %v", err)
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return fmt.Errorf("error al leer la respuesta: %v", err)
    }

    fmt.Println("Respuesta del servidor:", string(body))
    return nil
} */
func sendDataToAPI(apiURL string, endpoint string, data interface{}) error {
    jsonData, err := json.Marshal(data)
    if err != nil {
        return fmt.Errorf("error al convertir a JSON: %v", err)
    }

   

    resp, err := http.Post(apiURL+endpoint, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        return fmt.Errorf("error al enviar datos: %v", err)
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return fmt.Errorf("error al leer la respuesta: %v", err)
    }

    fmt.Println("Respuesta del servidor:", string(body))
    return nil
}

func postScheduledData(apiURL string) {

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("=========DATOS MODULO CPU =========")
			fmt.Println(" ")

			cmdCpu := exec.Command("sh", "-c", "cat /proc/cpu")
			outCpu, errCpu := cmdCpu.CombinedOutput()
			if outCpu != nil {
				fmt.Println(errCpu)
			}
	
			fmt.Println("===== CPU =======")
			var cpu_info Cpu
			err := json.Unmarshal([]byte(outCpu), &cpu_info)
			if err != nil {
				fmt.Println(err)
			}

			p_cpu, err := cpu.Percent(time.Second, false)
			if err != nil {
				fmt.Println()
			}

			cpu_info.Usage = p_cpu[0]
			//insertar en la base de datos
			err = sendDataToAPI(apiURL, "/cpu", cpu_info)
            if err != nil {
                fmt.Println("Error al enviar datos de CPU:", err)
            }

			fmt.Println(" ")
			fmt.Println("=========DATOS MODULO RAM =========")
			fmt.Println(" ")

			cmdRam := exec.Command("sh", "-c", "cat /proc/ram")
			outRam, errRam := cmdRam.CombinedOutput()
			if errRam != nil {
				fmt.Println(errRam)
			}

			fmt.Println("===== RAM =======")
			var ram_info Ram
			err = json.Unmarshal([]byte(outRam), &ram_info)
			if err != nil {
				fmt.Println(err)
			}

			err = sendDataToAPI(apiURL, "/ram", ram_info)
            if err != nil {
                fmt.Println("Error al enviar datos de RAM:", err)
            }
			fmt.Println(" ")

		}
	}

}



func main() {
	fmt.Println("Stating server... ")
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", index).Methods("GET")
	apiURL := os.Getenv("API_URL")
	go postScheduledData(apiURL)
	headers := handlers.AllowedHeaders([]string{"X-Request-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	fmt.Println("Server started at port 5200")
	log.Fatal(http.ListenAndServe(":5200", handlers.CORS(headers, methods, origins)(router)))
}
