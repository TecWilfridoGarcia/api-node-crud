const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Configurar la conexión a la base de datos SQLite
const db = new sqlite3.Database(':memory:');

// Crear la tabla de estudiantes en la base de datos
db.serialize(() => {
    db.run('CREATE TABLE estudiantes ( id INTEGER PRIMARY KEY, nombre TEXT, apellido TEXT, identificacion TEXT, telefono TEXT, direccion TEXT, categoria TEXT, horario TEXT, observaciones TEXT)');
});

// Configurar la aplicación Express
const app = express();
app.use(express.json());

// Definir las rutas CRUD
app.get('/estudiantes', (req, res) => {
    // Obtener todos los estudiantes
    db.all('SELECT * FROM estudiantes', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener los estudiantes' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/estudiantes/:id', (req, res) => {
    // Obtener un ejemplo por su ID
    db.get('SELECT * FROM estudiantes WHERE id = ?', req.params.id, (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el ejemplo' });
        } else if (!row) {
            res.status(404).json({ error: 'Ejemplo no encontrado' });
        } else {
            res.json(row);
        }
    });
});

app.post('/estudiantes', (req, res) => {

    // Crear un nuevo ejemplo
    const { nombre, apellido, identificacion, telefono, direccion, categoria, horario, observaciones } = req.body;
    if (!['8am - 10am', '10am - 12am', '1pm - 3pm','3pm - 5pm'].includes(horario)) {
        res.status(400).json({ error: 'Valor de horario inválido' });
        return;
    }

    db.get('SELECT * FROM estudiantes WHERE identificacion = ?', identificacion, (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Error al crear el ejemplo' });
        } else if (row) {
            res.status(400).json({ error: 'Ya el estudiante existe en nuestro registro!' });
        }
        else {
            db.run('INSERT INTO estudiantes (nombre, apellido, identificacion, telefono, direccion, categoria,horario, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nombre, apellido, identificacion, telefono, direccion, categoria, horario, observaciones], function (err) {
                if (err) {
                    res.status(500).json({ error: 'Error al crear el ejemplo', err });
                } else {
                    res.json({ id: this.lastID });
                }
            });
        }
    })
});

app.put('/estudiantes/:id', (req, res) => {
    // Actualizar un ejemplo existente
    const { nombre, apellido, identificacion, telefono, direccion, categoria, horario, observaciones } = req.body;
    db.run('UPDATE estudiantes SET nombre = ?, identificacion = ? WHERE id = ?', [nombre, apellido, identificacion, telefono, direccion, categoria, horario, observaciones, req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar el ejemplo' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Ejemplo no encontrado' });
        } else {
            res.json({ message: 'Ejemplo actualizado' });
        }
    });
});

app.listen(3000)
