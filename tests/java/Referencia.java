import com.mycompany.calculadoraenergeticamoderna.PanelSomatotipo;
import java.util.Locale;

//genera valores de referencia con el codigo java para las pruebas de la demo web
public class Referencia {
    //sexo, edad, peso, altura, cintura, cadera, 7 pliegues JP, supraespinal, pliegue pantorrilla, humero, femur, brazo, pantorrilla, idx actividad, ecuacion
    static Object[][] P = {
        {"Mujer", 21, 58.0, 162.0, 70.0, 96.0, new double[]{10,11,18,14,20,15,24}, 12.0, 16.0, 6.0, 8.8, 26.5, 34.0, 1, "Mifflin-St Jeor"},
        {"Hombre", 23, 74.0, 176.0, 82.0, 98.0, new double[]{9,11,10,13,18,14,12}, 9.0, 8.0, 7.0, 9.6, 31.0, 37.0, 2, "Harris-Benedict"},
        {"Hombre", 20, 92.0, 172.0, 98.0, 106.0, new double[]{20,24,18,26,34,28,22}, 22.0, 15.0, 7.2, 10.0, 35.0, 40.0, 0, "Valencia"},
        {"Mujer", 19, 50.0, 168.0, 64.0, 88.0, new double[]{6,7,12,9,11,8,16}, 7.0, 10.0, 5.8, 8.4, 23.5, 32.0, 3, "Mifflin-St Jeor"},
        {"Hombre", 22, 68.0, 181.0, 76.0, 92.0, new double[]{5,6,6,8,9,7,8}, 5.0, 5.0, 6.8, 9.4, 29.0, 35.0, 4, "Harris-Benedict"},
    };
    static double[] H = {1.2, 1.4, 1.6, 1.75, 1.95}, M = {1.2, 1.35, 1.5, 1.65, 1.8};

    public static void main(String[] a) {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < P.length; i++) {
            Object[] p = P[i];
            String sexo = (String) p[0]; int edad = (int) p[1];
            double peso = (double) p[2], altura = (double) p[3], cintura = (double) p[4], cadera = (double) p[5];
            double[] pl = (double[]) p[6];
            //PanelIMC
            double imc = peso / ((altura / 100.0) * (altura / 100.0));
            double pesoIdeal = "Hombre".equalsIgnoreCase(sexo) ? altura - 100 - ((altura - 150) / 4.0) : altura - 100 - ((altura - 150) / 2.0);
            double suma = 0; for (double v : pl) suma += v;
            double sc = Math.pow(suma, 2);
            double dc = "Hombre".equalsIgnoreCase(sexo)
                    ? 1.112 - 0.00043499 * suma + 0.00000055 * sc - 0.00028826 * edad
                    : 1.097 - 0.00046971 * suma + 0.00000056 * sc - 0.00012828 * edad;
            double grasa = (495 / dc) - 450;
            double magra = peso - peso * grasa / 100.0;
            //PanelGastoEnergetico
            String ec = (String) p[14]; double geb;
            if (ec.equals("Harris-Benedict")) geb = "Hombre".equals(sexo) ? 66.5 + (13.8 * peso) + (5.0 * altura) - (6.8 * edad) : 655.1 + (9.6 * peso) + (1.8 * altura) - (4.7 * edad);
            else if (ec.equals("Mifflin-St Jeor")) geb = "Hombre".equals(sexo) ? (10 * peso) + (6.25 * altura) - (5 * edad) + 5 : (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
            else if ("Hombre".equals(sexo)) geb = edad <= 30 ? 13.37 * peso + 747 : edad <= 60 ? 13.08 * peso + 693 : 14.21 * peso + 429;
            else geb = edad <= 30 ? 11.02 * peso + 679 : edad <= 60 ? 10.952 * peso + 677 : 10.98 * peso + 520;
            double factor = ("Hombre".equals(sexo) ? H : M)[(int) p[13]];
            double eta = geb * 0.10, efa = geb * (factor - 1), get = geb + eta + efa;
            //clase real de somatotipo
            PanelSomatotipo.ResultadoSomatotipo r = PanelSomatotipo.Somatotipo.calcularSomatotipoCompleto(
                    pl[2], pl[3], (double) p[7], (double) p[9], (double) p[10], (double) p[11], (double) p[12], (double) p[8], altura, peso);
            sb.append(String.format(Locale.US,
                "  {\"imc\": %.6f, \"pesoIdeal\": %.6f, \"icc\": %.6f, \"ict\": %.6f, \"densidad\": %.6f, \"grasa\": %.6f, \"magra\": %.6f, \"geb\": %.6f, \"eta\": %.6f, \"get\": %.6f, \"endo\": %.6f, \"meso\": %.6f, \"ecto\": %.6f, \"x\": %.6f, \"y\": %.6f, \"dominante\": \"%s\"}%s\n",
                imc, pesoIdeal, cintura / cadera, cintura / altura, dc, grasa, magra, geb, eta, get,
                r.getEndomorfia(), r.getMesomorfia(), r.getEctomorfia(), r.calcularX(), r.calcularY(), r.getTipoCorpoalDominante(), i < P.length - 1 ? "," : ""));
        }
        System.out.print(sb.append("]\n"));
    }
}
