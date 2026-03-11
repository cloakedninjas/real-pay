export default function Calculator() {
    return <form className="container">
        <fieldset>
            <label>
                Country
                <select>
                    <option>USA</option>
                </select>
            </label>
            <label>
                Starting salary
                <input
                    type="number"
                    name="baseSalary"
                    autoComplete=""
                />
            </label>
        </fieldset>

        <input
            type="submit"
            value="Calculate"
        />
    </form>
}
