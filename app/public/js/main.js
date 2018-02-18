var authToken = "";
var phonesList = [];

function login() {
    let name = $("input.name_val").val()
    let pass = $("input.pass_val").val()

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/login",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({
                    username: name,
                    password: pass
                }),
        success: function(result, status, xhr){
            authToken = result.token
            getPhones()
        },
        error(xhr, status, error) {
            showError(error)
        }
    });
}

function showError(err) {
    $("div.error").text(err)
    setTimeout(() => $("div.error").text(""), 1000)
}

function getPhones() {
    $.ajax({
        type: "GET",
        beforeSend: request => {
            request.setRequestHeader("Authorization", "Bearer " + authToken);
        },
        url: "http://localhost:3000/phones",
        contentType: 'application/json',
        success: function(result, status, xhr){
            drawPhones(result)
        },
        error(xhr, status, error) {
            showError(error)
        }
    });
}

function drawPhones(phones) {
    $("div.login").remove()
    $("div.main").append(`
        <div class='phones'>
            <div class="error"> </div>
            <div class='actions'>
                <div class="add-phone" onClick="addPhone()">Add phone</div>
                <div class="logout" onClick="logout()">Logout</div>
            </div>
            <div class="list">
            </div>
        </div>
    `);
    if (phones && phones.length) {
        phones.forEach(phone => appendPhone(phone.phone))
    }
}

function appendPhone(phone) {
    let item = {
        phone: phone,
        id: phonesList.length ? phonesList[phonesList.length - 1].id + 1 : 0
    };
    phonesList.push(item);
    $("div.list").append(`
        <div class='item' id='${item.id}'>
            <div class='label'> ${item.phone} </div>
            <div class='delete-phone' onClick=deletePhone(${item.id})> Delete </div>
        </div>
    `)
}

function logout() {
    $.ajax({
        type: "POST",
        beforeSend: request => {
            request.setRequestHeader("Authorization", "Bearer " + authToken);
        },
        url: "http://localhost:3000/logout",
        contentType: 'application/json',
        success: function(result, status, xhr){
            location.reload()
        },
        error(xhr, status, error) {
            showError(error)
        }
    });
}

function addPhone() {
    let phone = prompt('Enter new phone', "+7").trim();
    if (phone) {
        $.ajax({
            type: "POST",
            beforeSend: request => {
                request.setRequestHeader("Authorization", "Bearer " + authToken);
            },
            url: "http://localhost:3000/phones",
            contentType: 'application/json',
            dataType: "json",
            data: JSON.stringify({ phone: phone }),
            success: function(result, status, xhr){
                appendPhone(phone)
            },
            error(xhr, status, error) {
                showError(error)
            }
        })
    }
}

function deletePhone(id) {
    let phone = phonesList.find(p => p.id === id);
    $.ajax({
        type: "DELETE",
        beforeSend: request => {
            request.setRequestHeader("Authorization", "Bearer " + authToken);
        },
        url: "http://localhost:3000/phones",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({ phone: phone.phone }),
        success: function(result, status, xhr){
            $(`#${phone.id}`).remove()
        },
        error(xhr, status, error) {
            showError(error)
        }
    })
}
