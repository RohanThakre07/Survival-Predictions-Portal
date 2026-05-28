# Survival Predictions Portal

An interactive, high-fidelity data science suite and exploratory dashboard representing custom model predictions, dataset diagnostics, and advanced mathematical analyses. Created and developed entirely by **Rohan Thakare**.

**Repository:** [github.com/RohanThakre07/Survival-Predictions-Portal](https://github.com/RohanThakre07/Survival-Predictions-Portal.git)

---

## **Project Overview**

The **Survival Predictions Portal** serves as an interactive research exploration platform for advanced statistical predictive models and algorithmic theory. The application integrates real Jupyter Notebook parsing, real-time exploratory data analysis on continuous variables, and custom mathematical diagnostic engines within a single unified workspace.

The core objectives of the system are presented across four custom-built Machine Learning tasks:
1. **Titanic Survival Prediction:** Evaluates passenger data utilizing a custom-calibrated Random Forest Classifier archetype.
2. **Movie Rating Prediction:** Evaluates cinematic features and predicts IMDb scores using a continuous Ordinary Least Squares (OLS) Regression equation.
3. **Iris Flower Classification:** Implements discrete decision trees to classify botanical species based on physical sepal and petal measurements.
4. **Sales Prediction:** Evaluates marketing expenditure weights and outputs dynamic linear revenue predictions of continuous TV and print spends.

Additionally, to provide complete academic depth, the portal integrates real-world algorithmic diagnostics directly inside the prediction workflow:
- **Huffman Coding Binary Trees:** Dynamically calculates character occurrences of inputs and builds optimal prefix tree paths.
- **Fibonacci Run-Time Scaling:** Compares the linear execution boundaries of $O(N)$ non-recursive loops against the exponential $O(2^N)$ steps of recursive branches.

---

## **Technical Breakdown of Predictive Models**

### **1. Titanic Survival Classifier**
- **Model Type:** Random Forest Classifier (GridSearchCV-optimized: `n_estimators=200`, `max_depth=10`, `min_samples_split=4`)
- **Key Determinants:** Numerical passenger class (`Pclass`) and biological gender (`Sex`) represent the strongest positive coefficients for survival probability.
- **Formulation:** Evaluates features including `Age`, `SibSp`, `Parch`, `Fare`, and port of `Embarked` to compute survivability.

### **2. Movie Rating Regressor**
- **Model Type:** Ordinary Least Squares (OLS) Linear Regression
- **Key Determinants:** Continuous variables (`Year`, `Duration`, `Votes`) govern rating calculations.
- **Scientific Weights:** Larger durations and a vintage 'Year' coefficient provide progressive weight premiums, while total IMDb user counts (`Votes`) utilize logarithmic positive multipliers.

### **3. Iris Flower Botanical Classifier**
- **Model Type:** Multi-Class Decision Boundary System
- **Key Determinants:** Distinct mathematical cut-offs identify target label classification:
  - $\text{Petal Length} < 2.45\text{cm} \implies \text{Iris-setosa}$
  - $\text{Petal Width} > 1.75\text{cm} \implies \text{Iris-virginica}$
  - Remaining in-between $\implies \text{Iris-versicolor}$

### **4. Sales Medium Regressor**
- **Model Type:** Uni-Feature Linear Regression (governed principally by TV Advertising spends)
- **Mathematical Formula:** $\text{Predicted Sales (in thousands)} = 6.7308 + 0.0578 \times \text{TV Advertisement Spends}$
- **Continuous Variables:** Compares TV, Radio, and Newspaper mediums to plot correlations.

---

## **Integrated Algorithmic Diagnostics**

Rather than treating data science and software engineering algorithms as disconnected components, the portal links them dynamically:

### **Huffman Binary Tree Diagnostics**
When calculating movie or Titanic predictions, the portal encodes the exact input variables into optimal binary codes. This algorithm counts character frequencies and builds a binary tree representation with zero-prefix redundancy, illustrating the fundamental connection between information entropy and feature storage.

### **Fibonacci Performance Benchmarks**
Computes performance times and tracks exponential call growth to benchmark computing hardware, demonstrating the vast differences between linear $O(N)$ operations and recursive $O(2^N)$ tree structures.

---

## **Getting Started & Execution**

To duplicate or run the portal locally, proceed with the following instructions:

### **1. System Prerequisites**
- **TypeScript Runtime:** Node.js $18+$ 
- **Package Manager:** NPM or Bun

### **2. Installation & Set Up**
```sh
# Clone the verified repository
git clone https://github.com/RohanThakre07/Survival-Predictions-Portal.git

# Navigate to the workspace path
cd Survival-Predictions-Portal

# Install all development and runtime dependencies
npm install
```

### **3. Running the Portal Server**
```sh
# Start the integrated dev server
npm run dev

# Open your browser and navigate to the local portal
# URL: http://localhost:3000
```

### **4. Compiling the Standalone CJS Bundle**
To compile the client files and bundle the backend server into a production CJS file:
```sh
npm run build
npm run start
```

---

*Developed solely by Rohan Thakare. All rights reserved.*
